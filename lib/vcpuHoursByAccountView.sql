SELECT h.account_id,
    h.region,
    instance_type,
    h.instance_family,
    h.purchase_option,
    SUM(h.instance_hours) instance_hours,
    SUM(t.vcpu_count * h.instance_hours) vcpu_hours,
    h.year,
    h.month
FROM ${instanceHours} h
JOIN ${instanceTypes} t USING (instance_type)
GROUP BY h.account_id,
    h.region,
    instance_type,
    h.instance_family,
    h.purchase_option,
    h.year,
    h.month
