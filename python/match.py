import httplib, urllib2, cookielib
import re, urlparse, json
import gzip, StringIO
import name_gen
import pdb

HOST = 'www.match.com'

gen = name_gen.NameGen()

def urljoin(host, url):
	if not (host.startswith('http://') or host.startswith('https://')):
		host = 'http://' + host
	return urlparse.urljoin(host, url)

def processRequest(request_text):
	postdata = None
	try:
		split = request_text.index('\n\n')
		main_request = request_text[:split]
		postdata = request_text[split+1:].strip()
	except:
		main_request = request_text
	lines = filter(lambda x: x is not None and len(x) > 0, main_request.split('\n'))
	method, url = lines[0].split(' ')[:2]
	headers_raw = lines[1:]
	headers = {}
	host = None
	for header in headers_raw:
		try:
			split = header.index(':')
			key, value = header[:split], header[split+1:].strip()
			if key.lower() == 'host':
				host = value
			headers[key] = value
		except:
			continue
	url = urljoin(host, url)
	return (url, postdata, headers)

cookiejar = cookielib.CookieJar()
urlOpener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cookiejar))
request = urllib2.Request(*processRequest(open('requests/login.txt').read()))
resp = urlOpener.open(request)
print 'Logged in'

f = open('match_data.json', 'w')
f.write('[\n')

nextUrl = None
first_time = True
num_received = 0
while True:
	if nextUrl is None:
		request = urllib2.Request(*processRequest(open('requests/main_search.txt').read()))
	else:
		print 'Grabbing Next Page'
		request = urllib2.Request(nextUrl)
	resp = urlOpener.open(request)

	print 'Searching'
	page = resp.read()
	if resp.headers.get('content-encoding','') == 'gzip':
		page = gzip.GzipFile(fileobj=StringIO.StringIO(page)).read()

	open('page_out.html','w').write(page)
	#page = open('page_out.html', 'r').read()
	matches = re.findall('<a href="(/profile/showProfile\\.aspx\\?.*?)"><img class="profilePic" src=".*?"', page)
	nextUrl = urljoin(HOST, re.findall('class="next" href="(/search/searchSubmit\\.aspx[^"]*)">', page)[0])
	for profile in matches:
		print '* * * * *'
		request_tuple = processRequest(open('requests/login.txt').read())
		request_tuple = (urljoin(HOST, profile), request_tuple[1], request_tuple[2])
		request = urllib2.Request(*request_tuple)
		resp = urlOpener.open(request)
		page = resp.read()
		if resp.headers.get('content-encoding','').lower() == 'gzip':
			page = gzip.GzipFile(fileobj=StringIO.StringIO(page)).read()
		open('page_out.html','w').write(page)
	
		images = [image.replace('sthumbnails','pictures') for image in set(re.findall('<img src="(http://sthumbnails.match.com/sthumbnails/[^\\.]*\\.jpeg)"', page))]
		if len(images) < 5:
			continue
	
		geography = re.findall('<div id="traits" class="col col-8 last">[^<]*<br />[^<]*<p><strong class="[^"]*">[^<]*</strong></p>[^<]*<p>[^<]*<strong>[ \t\r\n]*([^<]*)<br />[ \t\r\n]*([^<]*)</strong>', page)
		if len(geography) == 0:
			continue
	
		# basic_traits = re.findall('<dt class="txt-darkBlue">.*?<strong>(.*?): *</strong>.*?</dt>.*?<dd class=".*?">[ \t\r\n]*(.*?)</dd>', page, re.DOTALL)
		# if len(basic_traits) == 0:
		# 	continue
		# for trait in basic_traits:
		# 	print trait[0].strip(), '-', trait[-1].strip()
		# 
		# personality_traits = re.findall('<dt class="span-5 txt-darkBlue">[^<]*<strong>([^<]*?): *</strong>[^<]*</dt>[^<]*<dd class="span-13 last Answered">[^<]*<div id="[^"]*" class="answer-view">([^<]*)</div>[^<]*<div class=[\\\'"]edit-view answers[\\\'"]></div>', page, re.DOTALL)
		# if len(personality_traits) == 0:
		# 	continue
		# for trait in personality_traits:
		# 	print trait[0].strip(), '-', trait[-1].strip()
	
		essay = re.findall('<p id="SelfEssay" class="essayText">([^<]*)</p>', page)
		if len(essay) == 0:
			continue
		if len(essay[0]) < 140:
			continue
		essay = essay[0]
		
		name = gen.pullName()
		num_received += 1
		jsondata = {'images':images[:5], 'geography':geography[0], 'essay':essay, 'name':name}
		if not first_time:
			f.write(',\n')
		f.write(json.dumps(jsondata))
		print num_received
		print '----------------------'
		print '======================'
f.write(']\n')
f.close()