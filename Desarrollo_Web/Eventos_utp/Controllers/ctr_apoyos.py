# IMPORTACIONES DE MODELOS
from Eventos_utp.models import Apoyo

class CD_Apoyos():
    def listar_apoyos(self):
        lista_apoyos =Apoyo.objects.all()
        return lista_apoyos
    
    def agregar_apoyos():
        apoyo_agregado=1
        return apoyo_agregado