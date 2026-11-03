
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CustomerViewSet,
    VehicleViewSet,
    JobCardViewSet,
    StaffViewSet,
    BillViewSet,
)

router = DefaultRouter()

router.register("customers", CustomerViewSet)
router.register("vehicles", VehicleViewSet)
router.register("jobs", JobCardViewSet)
router.register("staff", StaffViewSet)
router.register("bills", BillViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
