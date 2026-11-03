
from rest_framework import serializers
from .models import Customer, Vehicle, JobCard, Staff, Bill


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"


class VehicleSerializer(serializers.ModelSerializer):
    owner = serializers.CharField(
        source="customer.name",
        read_only=True
    )

    class Meta:
        model = Vehicle
        fields = [
            "id",
            "customer",
            "owner",
            "number",
            "brand",
            "model",
            "type",
            "date"
        ]


class JobCardSerializer(serializers.ModelSerializer):
    vehicleNumber = serializers.CharField(
        source="vehicle.number",
        read_only=True
    )

    owner = serializers.CharField(
        source="vehicle.customer.name",
        read_only=True
    )

    serviceType = serializers.CharField(
        source="service_type"
    )

    cost = serializers.DecimalField(
        source="estimated_cost",
        max_digits=10,
        decimal_places=2
    )

    class Meta:
        model = JobCard
        fields = [
            "id",
            "vehicle",
            "vehicleNumber",
            "owner",
            "serviceType",
            "complaint",
            "date",
            "status",
            "cost"
        ]


class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = "__all__"


class BillSerializer(serializers.ModelSerializer):
    vehicleNumber = serializers.CharField(
        source="job.vehicle.number",
        read_only=True
    )

    customerName = serializers.CharField(
        source="job.vehicle.customer.name",
        read_only=True
    )

    class Meta:
        model = Bill
        fields = "__all__"
