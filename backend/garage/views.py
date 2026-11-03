
from rest_framework import viewsets

from .models import Customer, Vehicle, JobCard, Staff, Bill

from .serializers import (
    CustomerSerializer,
    VehicleSerializer,
    JobCardSerializer,
    StaffSerializer,
    BillSerializer,
)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by("-id")
    serializer_class = CustomerSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.select_related(
        "customer"
    ).all().order_by("-id")
    serializer_class = VehicleSerializer


class JobCardViewSet(viewsets.ModelViewSet):
    queryset = JobCard.objects.select_related(
        "vehicle",
        "vehicle__customer"
    ).all().order_by("-id")
    serializer_class = JobCardSerializer


class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all().order_by("-id")
    serializer_class = StaffSerializer


class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.select_related(
        "job",
        "job__vehicle",
        "job__vehicle__customer"
    ).all().order_by("-id")
    serializer_class = BillSerializer
