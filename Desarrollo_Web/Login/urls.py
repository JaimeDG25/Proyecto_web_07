from django.urls import path
from . import views 
urlpatterns = [
    path('login/',views.login, name='login_vista'),
    path('codigo/',views.codigo_vista, name='codigo_vista'),
    path('enviar_codigo', views.enviar_codigo, name='enviar_codigo'),
    path('enviar_registro/', views.enviar_registro, name='enviar_registro'),
    path('registro_vista/',views.registro_vista, name='registro_vista'),
    path('enviar_datos',views.enviar_datos,name='enviar_datos')
]