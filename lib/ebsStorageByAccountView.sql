(
	SELECT line_item_usage_account_id account_id,
		product_volume_api_name volume_type,
		sum(line_item_usage_amount) as usage_gb,
		year,
		month
	FROM ${sourceTable}
	WHERE product_servicename LIKE '%Amazon Elastic Compute Cloud%'
		AND product_usagetype LIKE 'EBS:VolumeUsage%'
	GROUP BY line_item_usage_account_id,
		product_volume_api_name,
		year,
		month
)
UNION
(
	SELECT line_item_usage_account_id account_id,
		product_product_family volume_type,
		sum(line_item_usage_amount) as usage_gb,
		year,
		month
	FROM ${sourceTable}
	WHERE product_servicename LIKE '%Amazon Elastic Compute Cloud%'
		AND product_usagetype LIKE 'EBS:SnapshotUsage%'
	GROUP BY line_item_usage_account_id,
		product_product_family,
		year,
		month
)