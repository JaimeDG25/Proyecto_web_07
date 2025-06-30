
# IMPORTACIONES DE CONTROLES
from Eventos_utp.Controllers.ctr_apoyos import CD_Apoyos

obj_apoyo = CD_Apoyos();

class CN_Apoyos():

    def Listar_Apoyos():
        return obj_apoyo.listar_apoyos()
    
    def Agregar_Apoyos():
        return 