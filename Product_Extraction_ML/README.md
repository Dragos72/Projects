NLP model that extracts product names from a database of sites.

The repository contains 2 main directories: 'Final_product' which represents the code ready-to-run to extract products in the most efficient way (it containts little to no prints and comments).

Moreover, there is a Test_production directory that was used for debugging, containg comments about each element. In the same directory there is also a pdf with my thought process throughout the creation of the model.

At first, the algorithm web scrapes all the pages of each url, starting from the main domain the recursevely searching for other links and adding them into a set so it doesn't visit the same link twice.
After finding a page that contains '/products/' in the url, the text content is stored and the first 30 words of it are loaded into the model for predicting (because the product name will be included in the first 30 words).

The model predicts the product names and then they are added in a dictionary, along with their count. At the end, the algorithm prints the dictionary containing each product extracted and their count to see which products are more popular.

More details are in the thought_process pdf.
