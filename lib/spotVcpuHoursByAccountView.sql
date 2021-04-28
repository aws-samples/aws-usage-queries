SELECT account_id,
    SUM(vcpu_hours) vcpu_hours,
    SUM(
        case
            WHEN purchase_option != 'Spot' THEN vcpu_hours
            ELSE 0
        end
    ) AS other_vcpu_hours,
    SUM(
        case
            WHEN purchase_option = 'Spot' THEN vcpu_hours
            ELSE 0
        end
    ) AS spot_vcpu_hours,
    year,
    month
FROM ${vcpuHoursByAccount}
GROUP BY account_id,
    year,
    month