
# coding: utf-8

# In[1]:

import json
import numpy as np

with open('../data/results.json') as f: 
    data = json.load(f)


# In[2]:

genomesize = 6264404

tot_len = 0
for i in range(len(data['data'])):
    
    tot_len += data['data'][i]['attributes']['length']
    
gap_bet_contigs = (genomesize - tot_len) / len(data['data'])


##################################################################

for i in range(len(data['data'])):

    if 'confidence' in data['data'][i]['lanes'].keys():

        print "contig: %s" % data['data'][i]['attributes']['name']

        print data['data'][i]['attributes']['length']
        print len(data['data'][i]['lanes']['depth'])
        print len(data['data'][i]['lanes']['confidence'])

        print "\n"


###################################################################

# In[3]:

def parse_ref():
    
    parsed_reference = []
    ref = {}
    
    for num_contig in range(len(data['data'])):
        
        ref['id'] = num_contig
        ref['name'] = data['data'][num_contig]['attributes']['name']
        ref['strand'] = -1
        
        if num_contig == 0:
        
            ref['start'] = 0 
            ref['end'] = data['data'][num_contig]['attributes']['length']
            
        else:
            
            ref['start'] = ref['end'] + 1
            ref['end'] = ref['start'] + data['data'][num_contig]['attributes']['length']
            
        parsed_reference.append(ref.copy())
        ref['end'] += gap_bet_contigs 
        
    return parsed_reference
        
parsed_reference = parse_ref()


# In[4]:

def parse_lane(parsed_reference, lanetype, strand):
    
    parsed_lane = []
    track = {}
        
    for num_contig in range(len(data['data'])):
        
        contig_start_point = parsed_reference[num_contig]['start']
            
        try: #there might be no cs inside the contig

            for num_track in range(len(data['data'][num_contig]['lanes'][lanetype])):
                                    
                track['id'] = data['data'][num_contig-1]['attributes']['length'] + num_track #the id needs to be unique..
                track['name'] = num_track
                track['strand'] = strand
                track['start'] = contig_start_point + data['data'][num_contig]['lanes'][lanetype][num_track]['position'] 
                track['end'] = track['start'] + data['data'][num_contig]['lanes'][lanetype][num_track]['length']

                parsed_lane.append(track.copy())

        except KeyError:
            pass

    return parsed_lane

parsed_cs = parse_lane(parsed_reference, 'cs', strand = -2)
parsed_ucs = parse_lane(parsed_reference, 'ucs', strand = -3)


# In[5]:

lane_names = ['reference', 'cs', 'ucs']
lanes = [parsed_reference, parsed_cs, parsed_ucs]

contigs = []

for num_lane in range(len(lanes)):
        
    contig = {}

    contig['trackName'] = lane_names[num_lane]
    contig['trackType'] = 'stranded'
    contig['visible'] = True
    contig['inner_radius'] = 120
    contig['outer_radius'] = 160
    contig['trackFeatures'] = 'complex'
    contig['featureThreshold'] = 7000000
    contig['mouseclick'] = 'islandPopup'
    contig['mouseover_callback'] = 'islandPopup'
    contig['mouseout_callback'] = 'islandPopupClear'
    contig['linear_mouseclick'] = 'linearPopup'
    contig['showLabels'] = True
    contig['showTooltip'] = True
    contig['linear_mouseclick'] = 'linearClick'
    contig['items'] = []

    contig['items'] = lanes[num_lane]

    contigs.append(contig.copy())

    break


depth = {}
depth['trackName'] = "gcplot"
depth['trackType'] = "plot"
depth['visible'] = "true"
depth["plot_min"] =  np.min(data['data'][7]['lanes']['depth'])
depth["plot_max"] =  np.max(data['data'][7]['lanes']['depth'])
depth["plot_mean"] = np.mean(data['data'][7]['lanes']['depth']) 
depth["bp_per_element"] = 500
depth["plot_width"] = 75
depth["plot_radius"] = 230
depth["linear_plot_width"] = 100
depth["linear_plot_height"] = 150
depth["items"] = data['data'][7]['lanes']['depth']

contigs.append(depth.copy())

    
## add another reference
contig['trackName'] = 'contig'
contig['inner_radius'] = 30
contig['outer_radius'] = 480

contig['items'] = parsed_reference

contigs.append(contig.copy())


# In[6]:

# save to file:
with open('../data/contig.data.json', 'w') as f:
    json.dump(contigs, f, indent=3)


# In[ ]:



