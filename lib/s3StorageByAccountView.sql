SELECT line_item_usage_account_id account_id,
    product_volume_type storage_class,
    sum(line_item_usage_amount) as usage_gb,
    year,
    month
FROM ${sourceTable}
WHERE product_servicename LIKE '%Amazon Simple Storage Service%'
    AND product_volume_type not like ''
    AND product_volume_type not like 'Tags'
GROUP BY line_item_usage_account_id,
    product_volume_type,
    year,
    month