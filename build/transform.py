import yaml, sys, json
from os import path

def change_asset_destination(doc, bucket):
    """
    changes the destination to the bucket, without role assumption
    """

    for asset in doc["files"].values():
        del asset["destinations"]["current_account-current_region"]["assumeRoleArn"]
        asset["destinations"]["current_account-current_region"]["bucketName"] = bucket

def change_template_bucket(doc, bucket):
    """
    Replaces bucket names, removes metadata
    """
    
    for resource, config in doc["Resources"].items():
        if "Code" in config["Properties"]:
            config["Properties"]["Code"]["S3Bucket"] = bucket

        if "Content" in config["Properties"]:
            config["Properties"]["Content"]["S3Bucket"] = bucket

        del config["Metadata"]

def main(assets, template, bucket, version, build_no, commit):

    # read assets file
    with open(assets) as input_file:
        asset_doc = yaml.load(input_file, Loader=yaml.FullLoader)

    change_asset_destination(asset_doc, bucket)

    # write transformed assets file
    with open(path.join(path.dirname(input_file.name), 'assets.json'), 'w') as output_file:
        json.dump(asset_doc, output_file, sort_keys=False)

    # read template file
    with open(template) as input_file:
        template_doc = yaml.load(input_file, Loader=yaml.FullLoader)

    change_template_bucket(template_doc, bucket)

    template_doc["Transform"] = "AWS::Serverless-2016-10-31"
    del template_doc["Resources"]["CDKMetadata"]
    del template_doc["Conditions"]
    del template_doc["Rules"]
    del template_doc["Parameters"]["BootstrapVersion"]

    commit_short = commit[:6]

    sem_ver = ("%s+%s.%s" % (version, build_no, commit_short))

    template_doc["Metadata"] = {
        "AWS::ServerlessRepo::Application": {
            "Name": "aws-usage-queries",
            "Description": """This application bootstraps everything needed to
                query the AWS Cost and Usage reports through Amazon Athena. It
                also includes reference data and preconfigured SQL queries.""",
            "Author": "Steffen Grunwald",
            "SpdxLicenseId": "MIT-0",
            "HomePageUrl": "https://github.com/aws-samples/aws-usage-queries",
            "SourceCodeUrl": ("https://github.com/aws-samples/aws-usage-queries/tree/%s" % commit_short),
            "SemanticVersion": sem_ver
        }
    }
    with open(path.join(path.dirname(input_file.name), 'template.yaml'), 'w') as output_file:
        yaml.dump(template_doc, output_file, sort_keys=False)

if __name__ == "__main__":
    assets = sys.argv[1]
    template = sys.argv[2]
    bucket = sys.argv[3]
    version = sys.argv[4]
    build_no = sys.argv[5]
    commit = sys.argv[6]
    main(assets, template, bucket, version, build_no, commit)
