from pyspark.sql import SparkSession
from pyspark.ml import Pipeline
from sparknlp.annotator import *
from sparknlp.common import *
from sparknlp.base import *
import sparknlp
spark = sparknlp.start()
print("Spark NLP version: ", sparknlp.version())
print("Apache Spark version: ", spark.version)

spark

from sparknlp.training import CoNLL
training_data = CoNLL().readDataset(spark, './txtf2.conll')
training_data.show()

bert = BertEmbeddings.pretrained('bert_base_cased', 'en').setInputCols(["sentence",'token'])\
.setOutputCol("bert")\
.setCaseSensitive(False)\
.setPoolingLayer(0) # default 0

nerTagger = NerDLApproach()\
.setInputCols(["sentence", "token", "bert"])\
.setLabelColumn("label")\
.setOutputCol("ner")\
.setMaxEpochs(1)\
.setRandomSeed(0)\
.setVerbose(1)\
.setValidationSplit(0.2)\
.setEvaluationLogExtended(True)\
.setEnableOutputLogs(True)\
.setIncludeConfidence(True)\
.setTestDataset("test_withEmbeds.parquet")

ner_pipeline = Pipeline(stages = [bert, nerTagger])
ner_model = ner_pipeline.fit(training_data)