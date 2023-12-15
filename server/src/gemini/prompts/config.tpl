Compare content of two files (file1 and file2) listed bellow. Content can be any format which is usually used in configuration files - JSON, yaml, etc.. If format of both files is the same and files are not very different - respond with structured response (in JSON format, keys: type,usage,summarize,diff(property,old,new,meaning)) with information about type of this file, where it can be used and also add information about differences, and what this changes could mean for configuration. Include every differences in diff. Include all path to property. Output format: JSON without any prefixes

file1: %FILE1%

file2: %FILE2%