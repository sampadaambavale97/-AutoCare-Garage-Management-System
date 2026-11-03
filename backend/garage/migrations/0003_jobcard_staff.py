# Generated for AutoCare persistent job cards and staff records.

import django.db.models.deletion
from decimal import Decimal
from django.db import migrations, models


def add_demo_records(apps, schema_editor):
    Vehicle = apps.get_model("garage", "Vehicle")
    JobCard = apps.get_model("garage", "JobCard")
    Staff = apps.get_model("garage", "Staff")

    vehicle = Vehicle.objects.filter(number="MH09AB1234").first()
    if vehicle and not JobCard.objects.exists():
        JobCard.objects.bulk_create([
            JobCard(
                vehicle=vehicle,
                service_type="General Service",
                complaint="Regular servicing required, engine oil and filter replacement",
                date="2026-11-03",
                status="Pending",
                estimated_cost=Decimal("799.00"),
            ),
            JobCard(
                vehicle=vehicle,
                service_type="Oil Change",
                complaint="Engine oil is old and needs replacement",
                date="2026-11-03",
                status="In Progress",
                estimated_cost=Decimal("650.00"),
            ),
            JobCard(
                vehicle=vehicle,
                service_type="Tyre & Brake Service",
                complaint="Brake noise and tyre inspection required",
                date="2026-11-03",
                status="Pending",
                estimated_cost=Decimal("1200.00"),
            ),
            JobCard(
                vehicle=vehicle,
                service_type="Battery & Electrical",
                complaint="Battery checking and electrical connection issue",
                date="2026-11-03",
                status="Completed",
                estimated_cost=Decimal("1500.00"),
            ),
        ])

    if not Staff.objects.exists():
        Staff.objects.bulk_create([
            Staff(name="Akash Patil", mobile="9876543210", email="akash@gmail.com", role="Mechanic", address="Kolhapur", salary=Decimal("15000.00"), status="Active"),
            Staff(name="Rohit Jadhav", mobile="9876543211", email="rohit@gmail.com", role="Mechanic", address="Kolhapur", salary=Decimal("14000.00"), status="Active"),
            Staff(name="Pooja Shinde", mobile="9876543212", email="pooja@gmail.com", role="Service Advisor", address="Kolhapur", salary=Decimal("18000.00"), status="Active"),
            Staff(name="Sagar More", mobile="9876543213", email="sagar@gmail.com", role="Admin", address="Kolhapur", salary=Decimal("20000.00"), status="Active"),
        ])


class Migration(migrations.Migration):

    dependencies = [
        ("garage", "0002_vehicle"),
    ]

    operations = [
        migrations.CreateModel(
            name="JobCard",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("service_type", models.CharField(max_length=100)),
                ("complaint", models.TextField()),
                ("date", models.DateField()),
                ("status", models.CharField(choices=[("Pending", "Pending"), ("In Progress", "In Progress"), ("Completed", "Completed")], default="Pending", max_length=20)),
                ("estimated_cost", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("vehicle", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="job_cards", to="garage.vehicle")),
            ],
        ),
        migrations.CreateModel(
            name="Staff",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("mobile", models.CharField(max_length=15, unique=True)),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("role", models.CharField(choices=[("Mechanic", "Mechanic"), ("Service Advisor", "Service Advisor"), ("Admin", "Admin"), ("Manager", "Manager")], default="Mechanic", max_length=30)),
                ("address", models.TextField(blank=True)),
                ("salary", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("status", models.CharField(choices=[("Active", "Active"), ("Inactive", "Inactive")], default="Active", max_length=20)),
            ],
        ),
        migrations.RunPython(add_demo_records, migrations.RunPython.noop),
    ]
