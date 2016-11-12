from django.shortcuts import render

# Create your views here.
# what views do is take a request and give something back.
# urls are the ones controlling where our request is going.

def visualisegenome(request):
	return render(request, "index.html")