import json
import numpy as np

def parse_ref(data, gap_bet_contigs):
    
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
        
def parse_lane(data, parsed_reference, lanetype, strand):
    
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


def parse_file(file_name):

    genomesize = 6264404
    dir = '../static_env/media_root/FilesToProcess/'
    dir_in = dir + file_name

    with open(dir_in) as f: 
        data = json.load(f)

    tot_len = 0
    for i in range(len(data['data'])):
        
        tot_len += data['data'][i]['attributes']['length']
        
    gap_bet_contigs = (genomesize - tot_len) / len(data['data'])

    parsed_reference = parse_ref(data, gap_bet_contigs)
    parsed_cs = parse_lane(data, parsed_reference, 'cs', strand = -2)
    parsed_ucs = parse_lane(data, parsed_reference, 'ucs', strand = -3)

    lane_names = ['reference', 'cs', 'ucs']
    lanes = [parsed_reference, parsed_cs, parsed_ucs]

    contigs = []

    for num_lane in range(len(lanes)):
            
        contig = {}

        contig['trackName'] = lane_names[num_lane]
        contig['trackType'] = 'stranded'
        contig['visible'] = True
        contig['inner_radius'] = 120
        contig['outer_radius'] = 180
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

    depth = {}

    for i in range(len(data['data'])):

        if 'depth' in data['data'][i]['lanes'].keys():

            depth['trackName'] = "gcplot"
            depth['trackType'] = "plot"
            depth['visible'] = "true"
            depth["plot_min"] =  np.min(data['data'][i]['lanes']['depth'])
            depth["plot_max"] =  np.max(data['data'][i]['lanes']['depth'])
            depth["plot_mean"] = np.mean(data['data'][i]['lanes']['depth']) 
            depth["start"] = contigs[0]['items'][i]['start']
            depth["bp_per_element"] = 1
            depth["plot_width"] = 0
            depth["plot_radius"] = 0
            depth["linear_plot_width"] = 100
            depth["linear_plot_height"] = 150
            depth["items"] = data['data'][i]['lanes']['depth']

            contigs.append(depth.copy())
        
    ## add another reference
    contig['trackName'] = 'contig'
    contig['inner_radius'] = 30
    contig['outer_radius'] = 480

    contig['items'] = parsed_reference

    contigs.append(contig.copy())

    return contigs

    