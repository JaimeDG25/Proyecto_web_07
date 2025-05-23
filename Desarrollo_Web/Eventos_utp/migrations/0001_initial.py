# Generated by Django 5.0.14 on 2025-05-22 18:38

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Apoyo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre_completo', models.CharField(max_length=200)),
                ('telefono', models.CharField(max_length=20)),
                ('dni', models.CharField(max_length=8, unique=True)),
                ('ruc', models.CharField(blank=True, max_length=11)),
                ('correo', models.EmailField(max_length=254)),
            ],
        ),
        migrations.CreateModel(
            name='Colegio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=200)),
                ('apellidos_encargado', models.CharField(max_length=100)),
                ('nombres_encargado', models.CharField(max_length=100)),
                ('telefono_encargado', models.CharField(max_length=9)),
                ('distrito', models.CharField(max_length=100)),
                ('link_ubicacion', models.URLField(blank=True)),
                ('archivo_excel', models.FileField(blank=True, null=True, upload_to='bases_datos/')),
            ],
        ),
        migrations.CreateModel(
            name='Promotor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombres', models.CharField(max_length=100)),
                ('apellidos', models.CharField(max_length=100)),
                ('codigo', models.CharField(max_length=20, unique=True)),
                ('telefono', models.CharField(max_length=20)),
                ('dni', models.CharField(max_length=8, unique=True)),
                ('correo', models.EmailField(max_length=254)),
            ],
        ),
        migrations.CreateModel(
            name='Asistencia',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rol', models.CharField(choices=[('bus', 'Bus (S/ 50.00)'), ('campus', 'Campus (S/ 40.00)')], max_length=10)),
                ('turno', models.CharField(choices=[('mañana', 'Mañana'), ('tarde', 'Tarde')], max_length=10)),
                ('fecha', models.DateField()),
                ('apoyo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Eventos_utp.apoyo')),
                ('colegio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Eventos_utp.colegio')),
            ],
        ),
        migrations.CreateModel(
            name='OrdenPago',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('numero_documento', models.CharField(max_length=20, unique=True)),
                ('fecha_generacion', models.DateTimeField(auto_now_add=True)),
                ('total_pagado', models.DecimalField(decimal_places=2, max_digits=10)),
                ('pdf_oc', models.FileField(blank=True, null=True, upload_to='documentos_oc/')),
                ('pdf_nr', models.FileField(blank=True, null=True, upload_to='documentos_nr/')),
                ('apoyo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Eventos_utp.apoyo')),
            ],
        ),
        migrations.CreateModel(
            name='AsistenciaEnOrden',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('asistencia', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Eventos_utp.asistencia')),
                ('orden', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='asistencias', to='Eventos_utp.ordenpago')),
            ],
        ),
        migrations.AddField(
            model_name='colegio',
            name='promotor',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Eventos_utp.promotor'),
        ),
    ]
