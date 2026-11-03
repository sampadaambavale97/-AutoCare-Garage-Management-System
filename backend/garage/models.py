from django.db import models


class Customer(models.Model):
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Vehicle(models.Model):
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="vehicles"
    )
    number = models.CharField(max_length=20, unique=True)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    type = models.CharField(max_length=50)
    date = models.DateField()

    def __str__(self):
        return self.number


class JobCard(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("In Progress", "In Progress"),
        ("Completed", "Completed"),
    ]

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name="job_cards"
    )
    service_type = models.CharField(max_length=100)
    complaint = models.TextField()
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Job #{self.id} - {self.vehicle.number}"


class Staff(models.Model):
    ROLE_CHOICES = [
        ("Mechanic", "Mechanic"),
        ("Service Advisor", "Service Advisor"),
        ("Admin", "Admin"),
        ("Manager", "Manager"),
    ]
    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Inactive", "Inactive"),
    ]

    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15, unique=True)
    email = models.EmailField(blank=True)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default="Mechanic")
    address = models.TextField(blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Active")

    def __str__(self):
        return f"{self.name} ({self.role})"

class Bill(models.Model):
    PAYMENT_STATUS = [
        ("Paid", "Paid"),
        ("Pending", "Pending"),
        ("Partial", "Partial"),
    ]

    job = models.ForeignKey(
        JobCard,
        on_delete=models.CASCADE,
        related_name="bills"
    )

    bill_date = models.DateField(auto_now_add=True)

    description = models.TextField()

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    paid_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default="Pending"
    )

    def __str__(self):
        return f"Bill #{self.id}"
