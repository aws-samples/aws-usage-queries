import os
import subprocess


def on_event(event, context):
  asset_dir = os.getcwd()
  props = event["ResourceProperties"]
  bucket_name = props["bucketName"]
  wipeWholeBucket = props.get('wipeWholeBucket', "false") == "true"

  request_type = event['RequestType']

  if request_type in ['Create', 'Update']:
    return sync(asset_dir, bucket_name, wipeWholeBucket)
  if request_type == 'Delete':
    if wipeWholeBucket:
      return empty(bucket_name)
    else:
      return
  raise Exception("Invalid request type: %s" % request_type)

def sync(asset_dir, bucket_name, wipeWholeBucket):
  command = [
    "/opt/awscli/aws",
    "s3", "sync", asset_dir, ("s3://%s" % bucket_name),
    "--no-progress"
    ]

  if wipeWholeBucket:
    command.append("--delete")

  subprocess.run(command, check=True)

  physical_id = ("bucketDeploment-%s" % bucket_name)
  return { 'PhysicalResourceId': physical_id }

def empty(bucket_name):
  subprocess.run([
    "/opt/awscli/aws",
    "s3", "rm", ("s3://%s" % bucket_name),
    "--recursive"
    ], check=True)
