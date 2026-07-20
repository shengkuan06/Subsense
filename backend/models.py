from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from backend.database import Base

class Plan(Base):
    __tablename__ = "plans"
    plan_id = Column(String, primary_key=True)
    name = Column(String)
    tier = Column(String)
    price = Column(Float)
    seat_limit = Column(Integer)

class Customer(Base):
    __tablename__ = "customers"
    customer_id = Column(String, primary_key=True)
    name = Column(String)
    segment = Column(String)
    region = Column(String)
    plan_id = Column(String, ForeignKey("plans.plan_id"))
    mrr = Column(Float)
    signup_date = Column(Date)
    status = Column(String)          # active / paused / churned

class UsageEvent(Base):
    __tablename__ = "usage_events"
    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String, ForeignKey("customers.customer_id"))
    date = Column(Date)
    active_days = Column(Integer)
    sessions = Column(Integer)
    features_used = Column(Integer)
    seats_used = Column(Integer)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String, ForeignKey("customers.customer_id"))
    date = Column(Date)
    amount = Column(Float)
    method = Column(String)
    status = Column(String)          # paid / failed / retry
    retry_count = Column(Integer)

class SupportTicket(Base):
    __tablename__ = "support_tickets"
    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String, ForeignKey("customers.customer_id"))
    created_at = Column(DateTime)
    resolved_at = Column(DateTime, nullable=True)
    severity = Column(String)
    csat = Column(Float, nullable=True)

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String, ForeignKey("customers.customer_id"))
    date = Column(Date)
    nps = Column(Integer)
    sentiment = Column(Float)        # -1..1

class CustomerFeature(Base):
    __tablename__ = "customer_features"
    customer_id = Column(String, ForeignKey("customers.customer_id"), primary_key=True)
    usage_trend = Column(Float)
    adoption_rate = Column(Float)
    payment_reliability = Column(Float)
    ticket_velocity = Column(Float)
    avg_csat = Column(Float)
    tenure_days = Column(Integer)
    days_since_last_active = Column(Integer)

class HealthScore(Base):
    __tablename__ = "health_scores"
    customer_id = Column(String, ForeignKey("customers.customer_id"), primary_key=True)
    scored_at = Column(DateTime)
    score = Column(Float)
    usage_dim = Column(Float)
    engagement_dim = Column(Float)
    support_dim = Column(Float)
    outcome_dim = Column(Float)
    churn_prob = Column(Float)
    risk_band = Column(String)       # Healthy / At-Risk / Critical

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String, ForeignKey("customers.customer_id"))
    type = Column(String)            # upgrade / downgrade / pause / retry
    target_plan_id = Column(String, nullable=True)
    reason = Column(String)
    created_at = Column(DateTime)

class Intervention(Base):
    __tablename__ = "interventions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String, ForeignKey("customers.customer_id"))
    playbook = Column(String)        # pause_offer / winback / discount / csm_outreach / payment_retry
    status = Column(String)          # suggested / sent / accepted / declined
    created_at = Column(DateTime)
    outcome = Column(String, nullable=True)