from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    name: str
    email: str
    password: str = Field(min_length=6)
    subject: str | None = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserRead(BaseModel):
    id: str
    name: str
    email: str
    subject: str | None = None
    level: int = 1


class AuthRead(BaseModel):
    token: str
    user: UserRead


class ActivityDay(BaseModel):
    date: str
    minutes: int
    intensity: int = Field(ge=0, le=4)


class ProfileStatsRead(BaseModel):
    total_study_time: int = Field(alias="totalStudyTime")
    mastery_rate: float = Field(alias="masteryRate")
    retention_growth: float = Field(alias="retentionGrowth")
    activity_distribution: list[ActivityDay] = Field(alias="activityDistribution")
