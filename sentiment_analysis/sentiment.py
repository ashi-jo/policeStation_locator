from textblob import TextBlob
import argparse

def sentimentanalysis(msg):
   analysis = TextBlob(msg)
   # set sentiment
   if analysis.sentiment.polarity > 0:
      print("1")
   elif analysis.sentiment.polarity == 0:
      print("0")
   else:
      print("-1")

text = 'This is a test program. It demonstrates how to use the argparse module with a program description.'

ap = argparse.ArgumentParser()
ap.add_argument("-i", "--text", required=True,
	help="path to the input image")

args = vars(ap.parse_args())
sentimentanalysis(args["text"])