var tracks = [
	      { trackName: "track1",
		trackType: "stranded",
		visible: true,
		inner_radius: 80,
		outer_radius: 120,
		trackFeatures: "complex",
		featureThreshold: 7000000,
		mouseclick: 'islandPopup',
		mouseover_callback: 'islandPopup',
		mouseout_callback: 'islandPopupClear',
		linear_mouseclick: 'linearPopup',
		showLabels: true,
		showTooltip: true,
		linear_mouseclick: 'linearClick',
		items: [
                         {id: 1, start:0, end:30000, name:"island0", strand: -1},
                         {id: 2, start:60000,end:100000, name:"island1", strand: -1},
{id: 9, start: 1003990, end: 1003991, name: "terminator", strand: 1, feature: "terminator"},
                         {id: 3, start:800000,end:1000000, name:"island2withavery long name", strand: 1},
                         {id: 7, start:1000000,end:1200000, name:"intergenic", strand: 0},
{id: 11, start: 1125000, end:1500000, name:"promoter", strand: 1, feature:"arrow"},
{id: 12, start: 1150000, end:1500000, name:"promoter", strand: 1, feature:"arrow"},
                         {id: 4, start:1200000,end:1500000, name:"island3", strand: 1},
                         {id: 5, start:1500000,end:1700000, name:"island4",strand: -1, extraclass: "cellwall"},
{id: 10, start: 1409000, end: 1503991, name: "terminator2", strand: -1, feature: "terminator"},
{id:6, start:2000000,end:2100000, name:"is", strand: -1, extraclass: "innermembrane"},
{id: 13, start:2000000 , end: 2150000, name: "promoter", strand: -1, feature: "arrow"},
{id: 14, start:1500000 , end: 2250000, name: "promoter", strand: -1, feature: "arrow"},
			]
	      },
		  {
		      trackName: "gapTrack",
		      trackType: "gap",
		      inner_radius: 25,
		      outer_radius: 235,
		      showTooltip: true,
		      items: [
			      {id: 1, start: 6150000, end: 6151000, name: 'contig_gap1'},
			      {id: 2, start: 5350000, end: 5351000, name: 'contig_gap2'},
			      {id: 3, start: 2050000, end: 2051000, name: 'contig_gap3'},
			      {id: 4, start: 3250000, end: 3251000, name: 'contig_gap4'},
		     ]
          }
      ]


