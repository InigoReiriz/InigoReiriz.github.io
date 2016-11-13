from django.shortcuts import render
from django import forms
from .forms import DocumentForm

# Create your views here.
# what views do is take a request and give something back.
# urls are the ones controlling where our request is going.

def model_form_upload(request):
    if request.method == 'POST':
        form = DocumentForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = DocumentForm()
    return render(request, 'model_form_upload.html', {
        'form': form
    })