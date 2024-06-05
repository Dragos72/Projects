### this code includes little to no prints, as it is the final version of the ml model that is ready to run to extract products
### also, a lot of control variables were deleted (variable that kept track of the statement of running)

product_counts = {}
csv_file = './datasets/furniture_stores_pages.csv'

spark = sparknlp.start()

training_data = CoNLL().readDataset(spark, './datasets/training_data.conll')
training_data.show()

nerTagger = NerDLApproach()\
.setInputCols(["sentence", "token", "bert"])\
.setLabelColumn("label")\
.setOutputCol("ner")\
.setMaxEpochs(5)\
.setRandomSeed(0)\
.setVerbose(1)\
.setValidationSplit(0.2)\
.setEvaluationLogExtended(True)\
.setEnableOutputLogs(True)\
.setIncludeConfidence(True)\
.setTestDataset("test_withEmbeds.parquet")

bert = BertEmbeddings.pretrained('bert_base_cased', 'en').setInputCols(["sentence",'token']).setOutputCol("bert").setCaseSensitive(False)

test_data = CoNLL().readDataset(spark, './datasets/test_data.conll')
test_data = bert.transform(test_data)
test_data.write.parquet("test_withEmbeds.parquet")

ner_pipeline = Pipeline(stages = [bert, nerTagger])
ner_model = ner_pipeline.fit(training_data)

ner_model.stages[1].write().save('NER_bert_20240605')

document = DocumentAssembler()\
    .setInputCol("text")\
    .setOutputCol("document")

sentence = SentenceDetector()\
    .setInputCols(["document"])\
    .setOutputCol("sentence")

token = Tokenizer()\
    .setInputCols(["sentence"])\
    .setOutputCol("token")

bert = BertEmbeddings.pretrained('bert_base_cased', 'en')\
    .setInputCols(["sentence", "token"])\
    .setOutputCol("bert")\
    .setCaseSensitive(False)

loaded_ner_model = NerDLModel.load("NER_bert_20240605")\
    .setInputCols(["sentence", "token", "bert"])\
    .setOutputCol("ner")

converter = NerConverter()\
    .setInputCols(["document", "token", "ner"])\
    .setOutputCol("ner_span")

# Create the pipeline
custom_ner_pipeline = Pipeline(
    stages = [
        document,
        sentence,
        token,
        bert,
        loaded_ner_model,
        converter
    ]
)

ner_model.stages[1].write().overwrite().save('./NER_bert_20240605')
#predictions = ner_model.transform(test_data.select("sentence", "token", "label"))
#predictions.select('token.result','label.result','ner.result').show(truncate=40)
#df = predictions.select('token.result','label.result','ner.result').toPandas()
#df


    
def add_prods(df):
    current_product = ''

    # Iterate through each row in the DataFrame
    for index, row in df.iterrows():
        tokens = row['result'][0]  # Extract tokens from the row
        ner_tags = row['result'][1]   # Extract NER tags from the row

        # Iterate through each token and NER tag
        for i in range(0 , len(tokens)):
            # If it's the beginning of a new product
            if ner_tags[i] == 'B-PRD':
                current_product = tokens[i]
                for k in range(i+1, len(tokens)):
                    if ner_tags[k] == 'I-PRD':
                        current_product = current_product + " " + tokens[k]
                    else:
                        break
                    i = k - 1
                    if current_product in product_counts:
                        product_counts[current_product] += 1
                    else:
                        product_counts[current_product] = 1
                    break # since we only have 1 product per text input, we break after we find 1 product to not include other products dublicates or false positives 

def add_products_dataset(predictions):
    predictions.select('token.result','ner.result').show(truncate=40)
    df = predictions.select('token.result','ner.result').toPandas()
    add_prods(df)
    
def predict_data(text):
    prediction_data = spark.createDataFrame([[text]]).toDF("text")
    prediction_model = custom_ner_pipeline.fit(prediction_data)
    preds = prediction_model.transform(prediction_data)
    preds.show()
    add_products_dataset(preds)

def Extract_Raw_HTML(url):
    try:
        r = requests.get(url)
        if r.status_code != 200:
            print(f"Error: Unable to access URL {url}. Status code: {r.status_code}")
            return False
        html_content = r.text
        html_content_single_line = re.sub(r'\s+', ' ', html_content)
        return html_content_single_line
    except requests.RequestException as e:
        print(f"Error: Exception occurred while accessing URL {url}. Exception: {e}")
        return False

def Extract_data_from_csv(csv_file):
    try:
        df = pd.read_csv(csv_file, header=None)
    except FileNotFoundError:
        print(f"Error: CSV file not found at {csv_file}")
        exit()
    urls = df[0]
    return urls

def Transform_HTML_to_text(html_raw):
    soup = BeautifulSoup(html_raw, 'html.parser')
    for script_or_style in soup(['script', 'style']):
        script_or_style.decompose()
    text = soup.get_text(separator=' ', strip=True).strip()
    return text

def Append_to_textfile(text, text_file):
    with open(text_file, "a", encoding="utf-8") as file:
        file.write(text + '\n')

def get_first_30_words(text):
    words = text.split()
    first_30_words = words[:30]
    result = ' '.join(first_30_words)
    return result

def is_visited(url, visited_urls):
    return url in visited_urls

def visit_url(url, visited_urls):
    visited_urls.add(url)

def normalize_url(url):
    parsed_url = urlparse(url)
    normalized_path = urlunparse(parsed_url._replace(fragment=''))
    query_params = parse_qsl(parsed_url.query)
    sorted_query = urlencode(sorted(query_params))
    normalized_url = urlunparse(parsed_url._replace(query=sorted_query, fragment=''))
    return normalized_url

def extract_links_with_same_domain(url, base_domain, error_count):
    try:
        r = requests.get(url)
        if r.status_code != 200:
            error_count += 1
            return [], error_count
        soup = BeautifulSoup(r.text, 'html.parser')
        links = []
        for a in soup.find_all('a', href=True):
            href = a.get('href')
            full_url = urljoin(url, href)
            if urlparse(full_url).netloc == base_domain:
                normalized_url = normalize_url(full_url)
                links.append(normalized_url)
        return links, error_count
    except requests.RequestException as e:
        error_count += 1
        return [], error_count

def get_base_url(url):
    parsed_url = urlparse(url)
    base_url = urlunparse((parsed_url.scheme, parsed_url.netloc, '', '', '', ''))
    return base_url

def append_text(url, appended_urls, text_appended_count, training_data, unique_texts):
    path = urlparse(url).path.lower()
    
    if any(ext in path for ext in ['.jpg', '.png', '.jpeg']):
        return text_appended_count
    
    if ('/products/' in path or '/product/' in path) and url not in appended_urls:
        raw_html = Extract_Raw_HTML(url)
        if raw_html:
            text_content = Transform_HTML_to_text(raw_html)
            first_30_words = get_first_30_words(text_content)
            if first_30_words not in unique_texts:
                unique_texts.add(first_30_words)
                if text_appended_count < 5:
                    predict_data(first_30_words)
                    appended_urls.add(url)
                    text_appended_count += 1
    return text_appended_count

def crawl_website(base_url, training_data):
    visited_urls = set()
    appended_urls = set()
    unique_texts = set()
    error_count = 0

    def crawl(url):
        nonlocal error_count
        if error_count > 20:
            return
        normalized_url = normalize_url(url)
        if not is_visited(normalized_url, visited_urls):
            visit_url(normalized_url, visited_urls)
            links, error_count = extract_links_with_same_domain(normalized_url, urlparse(base_url).netloc, error_count)
            for link in links:
                if error_count > 20:
                    break
                text_appended_count = append_text(link, appended_urls, text_appended_count, training_data, unique_texts)
                crawl(link)

    crawl(base_url)    

urls = Extract_data_from_csv(csv_file)

# Process the first 100 URLs
for i, url in urls:
    base_url = get_base_url(url)
    if Extract_Raw_HTML(base_url):
        crawl_website(base_url, training_data)
    print(f"Processed {i+1} URLs")
    print("\n---------------------------\n")

sorted_products = sorted(product_counts.items(), key=lambda x: x[1], reverse=True)

# Print the top 5 products with their counts
print("Top 5 products with highest count:")
for product, count in sorted_products[:10]:
    print(f"{product}: {count}")    


print("Finished processing")