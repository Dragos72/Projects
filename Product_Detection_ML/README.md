# ML Model that is able to extract products from Furniture Stores

Note: The project is still in progress, yet not finished.

There is a list of URLs from furnitures stores sites. Most will have products on them, some won’t, some won’t even work at all.

The code provided should be able to extract the content from the list of URLs, transform the content into conll format and get predictions of products from the ml model.

The output will be a list of products, as well as a top 10 with the most popular products.

Moreover, the URL does not lead to an existing page of a site, the algorithm searches for the root site and checks if there is a connection.
The code will search for every link that appears in a site, therefore it will include multiple products from a single URL.

Current stage:

Creating a proper training data using Inception that will return the best output from the test data.