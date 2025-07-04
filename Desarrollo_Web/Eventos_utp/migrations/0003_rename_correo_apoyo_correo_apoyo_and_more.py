# Generated by Django 5.0.14 on 2025-07-01 05:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Eventos_utp', '0002_rename_apellidos_promotor_apellidos_promotor_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='apoyo',
            old_name='correo',
            new_name='correo_apoyo',
        ),
        migrations.RenameField(
            model_name='apoyo',
            old_name='dni',
            new_name='dni_apoyo',
        ),
        migrations.RenameField(
            model_name='apoyo',
            old_name='nombre_completo',
            new_name='nombre_completo_apoyo',
        ),
        migrations.RenameField(
            model_name='apoyo',
            old_name='ruc',
            new_name='ruc_apoyo',
        ),
        migrations.RenameField(
            model_name='apoyo',
            old_name='telefono',
            new_name='telefono_apoyo',
        ),
        migrations.RenameField(
            model_name='colegio',
            old_name='apellidos_encargado',
            new_name='apellidos_encargado_colegio',
        ),
        migrations.RenameField(
            model_name='colegio',
            old_name='archivo_excel',
            new_name='archivo_excel_colegio',
        ),
        migrations.RenameField(
            model_name='colegio',
            old_name='distrito',
            new_name='distrito_colegio',
        ),
        migrations.RenameField(
            model_name='colegio',
            old_name='link_ubicacion',
            new_name='link_ubicacion_colegio',
        ),
        migrations.RenameField(
            model_name='colegio',
            old_name='nombre',
            new_name='nombre_colegio',
        ),
        migrations.RenameField(
            model_name='colegio',
            old_name='nombres_encargado',
            new_name='nombres_encargado_colegio',
        ),
        migrations.RenameField(
            model_name='colegio',
            old_name='promotor',
            new_name='promotor_colegio',
        ),
        migrations.RenameField(
            model_name='colegio',
            old_name='telefono_encargado',
            new_name='telefono_encargado_colegio',
        ),
    ]
