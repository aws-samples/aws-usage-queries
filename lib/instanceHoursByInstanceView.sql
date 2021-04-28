SELECT line_item_usage_account_id AS account_id,
    product_region AS region,
    line_item_resource_id AS instance_id,
    IF(
        (product_instance_type <> ''),
        product_instance_type,
        SPLIT_PART(
            line_item_line_item_description,
            ' ',
            1
        )
    ) AS instance_type,
    IF(
        (
            SPLIT_PART(product_instance_type, '.', 2) = 'metal'
        ),
        product_instance_type,
        IF(
            (product_instance_type_family <> ''),
            product_instance_type_family,
            IF(
                (product_instance_type <> ''),
                SPLIT_PART(product_instance_type, '.', 1),
                SPLIT_PART(
                    line_item_line_item_description,
                    '.',
                    1
                )
            )
        )
    ) AS instance_family,
    IF(
        (pricing_term = ''),
        'Spot',
        pricing_term
    ) AS purchase_option,
    SUM(line_item_usage_amount) AS instance_hours,
    year,
    month
FROM ${sourceTable}
WHERE (
        (
            (
                product_product_name = 'Amazon Elastic Compute Cloud'
            )
            AND (
                line_item_operation LIKE 'RunInstance%'
            )
        )
        AND (
            (
                line_item_usage_type LIKE '%BoxUsage%'
            )
            OR (
                line_item_usage_type LIKE '%SpotUsage%'
            )
        )
    )
GROUP BY 1,
    2,
    3,
    4,
    5,
    6,
    8,
    9