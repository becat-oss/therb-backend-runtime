from subprocess import Popen
import sys
import os
import boto3
import zipfile

def main(cloud=True):
    if cloud:
        args = sys.argv
        bucket=args[1]
        key=args[2]
        zipFile = getS3(bucket,key).get()['Body']
    else:
        zipFile = open('test/dataset.zip','rb')

    #zipデータを解凍する
    with zipfile.ZipFile(zipFile) as zip:
        zip.extractall()

    #解凍したzipデータをtherb.exeでrunする
    print("cwd",os.getcwd())

    p = Popen('therb.exe')

    stdout,stderr=p.communicate()
    print('STDOUT: {}'.format(stdout))

    #結果をS3にアップロードする(therb-resultとかいうバケットに)

def getS3(bucket,key):
    s3 = boto3.resource('s3')
    obj = s3.Object(bucket,key)
    return obj

if __name__ == "__main__":
    result = main(False)