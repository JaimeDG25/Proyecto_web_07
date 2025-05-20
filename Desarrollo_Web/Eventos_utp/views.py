from django.shortcuts import render

# Create your views here.
def layout (request):
    return render(request, 'layout.html')

def index (request):
    return render(request, 'index.html')

def promotores (request):
    return render(request, 'promotor.html')

def colegios (request):
    return render(request, 'colegios.html')

def asistencia (request):
    return render(request, 'asistencia.html')

def generador (request):
    return render(request, 'generador.html')
