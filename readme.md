This is a repository of code snippets that takes the raw options alerts data from https://unusualwhales.com/ and prepares and consolidates it for analysis.

Data manipulation is done using Danfo.js, which is an open-source, JavaScript library providing high-performance, intuitive, and easy-to-use data structures for manipulating and processing structured data. Danfo.js is heavily inspired by the Pandas library and provides a similar interface and API. This means users familiar with the Pandas API can easily use Danfo.js. https://danfo.jsdata.org/

-1SortCol is used for sorting the columns and removes any commas that interfere with conversion to csv.
-2AddCol adds several columns that I need for my analysis.
-3aConcat consolidates all the monthly files into one big file.
-3bSplitByType splits the consolidated file into a file for calls and a file for puts. It also adds several winner columns for the different win definitions. This step is optional.
-4aSig tests each variable to determine if the mean for winning alerts differs significantly from the mean of losing alerts.
-4bSig tests each variable to determine if the mean for winning alerts differs significantly from the overall mean of all alerts. I consider this test optional.
-5aWinProb splits alerts into deciles based on each variable and calculates win rates.
-5bSingleVarbyVal allows you to dive deeper into specific variable ranges. This is an optional tool outside of the main flow.
-6aMutliVarByIndex queries a specific variable range by index and splits alerts into groups based on each variable and calculates win rates.
-6bMutliVarByVal queries a specific variable range by variable value and splits alerts into groups based on each variable and calculates win rates.
-6cMutliVarByGreek queries a specific variable range by variable value and splits alerts into groups based on very specific greek values and calculates win rates.
-7aSector calculates win rates for each sector.
-8aEmoji calculates win rates for each emoji.
