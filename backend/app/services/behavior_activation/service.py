def recommended_task_minutes(drop_off_rate: float) -> int:
    if drop_off_rate >= 0.5:
        return 5
    if drop_off_rate >= 0.25:
        return 10
    return 20
