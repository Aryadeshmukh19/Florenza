css=open('dist/app.css').read(); js=open('dist/app.js').read().replace('</script','<\\/script')
html=f'''<title>Florenza Microgreens</title>
<meta name="description" content="Florenza — fresh, premium, naturally grown microgreens from Pune, Maharashtra. Young greens, thoughtfully grown.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@200;300;400;500&display=swap">
<style>{css}</style>
<div id="root"></div>
<script>{js}</script>
'''
open('dist/florenza.html','w').write(html)
