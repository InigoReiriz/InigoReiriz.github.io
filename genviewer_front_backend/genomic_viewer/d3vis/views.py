from django.shortcuts import render
from django import forms
from .forms import DocumentForm
from .parsing import *
import json

# Create your views here.
# what views do is take a request and give something back.
# urls are the ones controlling where our request is going.

def model_form_upload(request):

    json_data = {}

    if request.method == 'POST':
        form = DocumentForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            for fname, file in request.FILES.iteritems():
                file_name = request.FILES[fname].name   

            parsed_data = parse_file(file_name)
            json_data= json.dumps(parsed_data) #encode it to json format
    else:
        form = DocumentForm()

    return render(request, 'model_form_upload.html', context = {'form': form, 'json_data': json_data})
