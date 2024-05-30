import requests
import re
from bs4 import BeautifulSoup
import pandas as pd
import nltk
from nltk.tokenize import word_tokenize

# Ensure the 'punkt' tokenizer is downloaded
nltk.download('punkt')

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
    
    # Remove script and style elements
    for script_or_style in soup(['script', 'style']):
        script_or_style.decompose()
    
    text = soup.get_text(separator=' ', strip=True).strip()
    return text

def Append_to_textfile(text, text_file):
    with open(text_file, "a", encoding="utf-8") as file:
        file.write(text + '\n')

def write_conll(output_file_path, text_content, labels=None):
    """
    This function appends text and labels to a CoNLL file.

    Args:
        output_file_path: The path to the CoNLL file.
        text_content: The text content to be added.
        labels (optional): A list of labels in the format [[start_index, end_index, label_text]].
    """
    text_content = text_content.strip()
    text_content = re.sub(r'\s+', ' ', text_content)
    
    if not text_content:
        print("Cannot add empty text to CoNLL file")
        return

    tokens = word_tokenize(text_content)
    labels = labels if labels is not None else []

    token_labels = ['O'] * len(tokens)
    
    for start, end, label in labels:
        entity_tokens = word_tokenize(text_content[start:end])
        entity_start_token = tokens.index(entity_tokens[0])
        entity_end_token = entity_start_token + len(entity_tokens)
        
        token_labels[entity_start_token] = 'B-' + label
        for i in range(entity_start_token + 1, entity_end_token):
            token_labels[i] = 'I-' + label

    with open(output_file_path, "a", encoding="utf-8") as conll_file:
        for token, token_label in zip(tokens, token_labels):
            conll_file.write(f"{token}\t{token_label}\n")
        conll_file.write("\n")

    print(f"Data has been appended to {output_file_path}")

# Paths to the files
csv_file = 'furniture_stores_pages.csv'
raw_html_text_file = 'datasets2\\raw_html_text_file.txt'
jsonl_file5 = "datasets2\\doccano_input.jsonl"
failed_connections_urls = "datasets2\\failed_connections_urls.txt"
working_connections_urls = "datasets2\\working_connections_urls.txt"
conll_file1 = "datasets2\\conll_file1.conll"
txtf = "datasets2\\txtf2.txt"

urls = Extract_data_from_csv(csv_file)
i = 0

for url in urls:
    i += 1
    raw_html = Extract_Raw_HTML(url)
    if raw_html:
        text = Transform_HTML_to_text(raw_html)
        if text:
            Append_to_textfile(url, working_connections_urls)
            Append_to_textfile(raw_html, raw_html_text_file)
            Append_to_textfile(text, txtf)
            write_conll(conll_file1, text)
    else:
        Append_to_textfile(url, failed_connections_urls)
    if i == 20:
        break

print("Finished")