var Gable = (function(){

	/* Public */
	/* The public API. Uses the Private object to do the dirty work. */

	/* This object is returned at the bottom of the function. In between lay the Private object code. */


	var current_table = {};
	var current_element = {};
	var tables = {};
	var charts = {};


	var Public = function( table_id ) {
		that = this;
		current_table = table_id;
		tables[ table_id ] = tables[ table_id ] || {};
		tables[ table_id ].delay = tables[ table_id ].delay || false;
		if( 'undefined' === typeof google ||  'undefined' === typeof google.visualization ) {
			var coreload = function() {
				Private.utils.loadChartType( 'corechart' );
			};
			Private.utils.loadVisualizationAPI( { on_success: coreload } );
		}
		return Public.prototype;
	};

	Public.prototype.add = function() {
		var req = arguments[ 0 ];
		if( 'undefined' === typeof arguments[ 0 ] ) {
			if( 'function' === typeof req.on_error ) {
				req.on_error( req );
			}
			return;
		}
		Private.data.add( current_table, req.value, req.meta );
		if( 'function' === typeof req.on_success ) {
			req.on_success( req.id );	
		}
		return Public.prototype;
	};

	Public.prototype.get = function() {

		var req = arguments[ 0 ];
		var table_id = current_table;
		var row = req.row;
		var column = req.column;
		var chs = charts[ table_id ];

		var on_success = function( res ) {
			if( 'function' === typeof req.on_success ) {
				req.on_success( res );
			}
		};

		var on_error = function() {
			if( 'function' === typeof req.on_error ) {
				req.on_error();
			}
		};
		
		if( isNaN( column ) ) {
			column = null;
		}
		
		if( isNaN( row ) ) {
			row = null;
		}

		if( 'undefined' !== typeof row && null !== row && 'undefined' !== typeof column && null !== column ) {
			Private.data.cell.get( table_id, row, column, on_success, on_error );
		} else if( 'undefined' !== typeof row && null !== row) {
			Private.data.row.get( table_id, row, on_success, on_error );
		} else if( 'undefined' !== typeof column && null !== column ) {
			Private.data.column.get( table_id, column, on_success, on_error );
		} else {
			Private.data.table.get( table_id, on_success, on_error );
		}
		return Public.prototype;
	};

	//req.type
	//req.meta
	//req.target
	Public.prototype.draw = function() {

		var request = arguments[ 0 ];
		var table_id = current_table;
		
		var funBody = function() {


			var req = Private.utils.clone( request );
			var doDraw = function() { 

				var raw = Private.data.get( table_id, 'raw' );

				if( 'undefined' !== typeof raw && null !== raw && 'undefined' === typeof raw.meta ) {
					raw.meta = {};
				}
				var id = table_id;
				if( 'undefined' !== typeof req && 'undefined' !== typeof req.id && null !== req.id ) {
					id = req.id;
				}
				var dt = new google.visualization.DataTable( Private.data.get( id, 'table' ) ); 
				var options = {};
				if( 'undefined' !== typeof raw && null !== raw && raw.meta ) {
					options = Private.utils.clone( raw.meta );
				}
				if( 'undefined' !== typeof req && null !== req && 'undefined' !== typeof req.meta ) {
					for( var attr in req.meta ) {
						if( req.meta.hasOwnProperty( attr ) ) {
							options[ attr ] = req.meta[ attr ];
						}
					}
				}
				var chart = {};
				//attempt to use table id if target not set

				if( 'undefined' === typeof req.target ) {
					req.target = id;
				}
				var target = document.getElementById( req.target );
				
				if( 'line' === req.type ) {
					chart = new google.visualization.LineChart( target );
				} else if( 'pie' === req.type ) {
					chart = new google.visualization.PieChart( target );
				} else if( 'scatter' === req.type ) {
					chart = new google.visualization.ScatterChart( target );
				} else if( 'gauge' === req.type ) {
					chart = new google.visualization.Gauge( target );
				} else if( 'geo' === req.type ) {
					chart = new google.visualization.GeoChart( target );
				} else if( 'table' === req.type ) {
					chart = new google.visualization.Table( target );
				} else if( 'treemap' === req.type ) {
					chart = new google.visualization.TreeMap( target );
				} else if( 'candlestick' === req.type ) {
					chart = new google.visualization.CandlestickChart( target );
				} else if( 'bar' === req.type ) {
					chart = new google.visualization.BarChart( target );
				} else if( 'stepped' === req.type ) {
					chart = new google.visualization.SteppedAreaChart( target );
				} else if( 'area' === req.type ) {
					chart = new google.visualization.AreaChart( target );
				} else if( 'column' === req.type ) {
					chart = new google.visualization.ColumnChart( target );
				} else if( 'combo' === req.type ) {
					chart = new google.visualization.ComboChart( target );
				}

				chart.draw( dt, options );
	
				if( 'undefined' === typeof charts[ id ] ) {
				       charts[ id ] = {};
				}
				charts[ id ][ req.target ] = req;

			}

			var ctype = Private.utils.chartType( req.type );
			if( !Private.utils.chartTypeIsLoaded( ctype ) ) {
				Private.utils.loadChartType( ctype, doDraw );
			} else {
				doDraw();
			}

		};

		var already_loaded = function() {
			if( !Private.utils.chartTypeIsLoaded( 'corechart' ) ) {
				Private.utils.loadChartType( 'corechart', funBody );
			} else {
				funBody();
			}

		};

		if( 'undefined' === typeof google ||  'undefined' === typeof google.visualization ) {
			Private.utils.loadVisualizationAPI( { on_success: already_loaded } );
		} else {
			already_loaded();
		}

		return Public.prototype;
	};

	Public.prototype.update = function() {
		var req = arguments[ 0 ];
		if( 'undefined' === typeof arguments[ 0 ] ) {
			if( 'function' === typeof req.on_error ) {
				req.on_error( req );
			}
			return Public.prototype;
		}
		var table_id = current_table;
		var id = req.id;
		var value = req.value;
		var meta = req.meta || null;
		var type = req.type || null;
		var row = req.row - 1; //array indexed at zero
		var column = req.column - 1;
		var chs = charts[ id ];
		var on_success = function( res ) {
			Private.charts.redraw( table_id );
			if( 'function' === typeof req.on_success ) {
				req.on_success( res );
			}
		};

		var on_error = function() {

			if( 'function' === typeof req.on_error ) {
				req.on_error();
			}
		};

		if( isNaN( column ) ) {
			column = null;
		}
		if( isNaN( row ) ) {
			row = null;
		}
		if( 'undefined' !== typeof row && null !== row && 'undefined' !== typeof column && null !== column ) {
			Private.data.cell.update( value, table_id, row, column, on_success, on_error );
		} else if( 'undefined' !== typeof row && null !== row ) {
			Private.data.row.update( value, table_id, row, id, meta, on_success, on_error );
		} else if( 'undefined' !== typeof column && null !== column ) {
		
			Private.data.column.update( table_id, column, id, type, meta, on_success, on_error );
		} else {
			Private.data.table.update( value, table_id, id, meta, on_success, on_error );
		}

		return Public.prototype;
	};

	Public.prototype.dump = function() {
		console.log( 'export', current_table, arguments );
		
		var result, type, given;
		var req = arguments[ 0 ];
		var res = arguments[ 1 ];

		var dump_on_success = function( obj  ) {

			if( 'undefined' !== typeof req ) {
				given = 'raw';
				if( 'raw' === req.type ) {
					result = obj;
				} else if ( 'csv' === req.type ) {
					result = Private.data.type.transform( given, req.type, obj )
				} else {
					if( Private.data.type.tranformsTo( 'raw',  req.type ) ) {
						result = Private.data.type.transform( given, req.type, obj )
					} else {
						if( 'function' === typeof req.on_error ) {
							req.on_error( { 'value': result, 'message': 'Could not be converted' } );
							return;
						}
					}
				}
			}

			if( 'function' === typeof req.on_success ) {
				req.on_success( result );
			}

		};

		var dump_on_error = function() {
			if( 'undefined' !== typeof req.on_error ) {
				req.on_error( { 'message': 'error dumping' } );
			}
		};

		if( null === req ) {
			if( 'undefined' !== typeof res ) {
				dump_on_success( res );
			}

		} else {
			Public.prototype.get( { 'row': req.row, 'column': req.column, 'on_success': dump_on_success, 'on_error': dump_on_error } );
		}

	
		return Public.prototype;
	};

	Public.prototype.remove = function( args ) {

		var req = arguments[ 0 ];
		if( 'undefined' === typeof arguments[ 0 ] ) {
			if( 'function' === typeof req.on_error ) {

				req.on_error( req );
			}
			return Public.prototype;
		}
		var table_id = current_table;
		var row = req.row;
		var column = req.column;
		var chs = charts[ table_id ];
		var on_success = function( res ) {
			console.log('success remove',res);
			Private.charts.redraw( table_id );
			if( 'function' === typeof req.on_success ) {
				req.on_success( res );
			}
		};

		var on_error = function() {

			if( 'function' === typeof req.on_error ) {
				req.on_error();
			}
		};
		if( isNaN( column ) ) {
			column = null;
		}
		if( isNaN( row ) ) {
			row = null;
		}
		if( 'undefined' !== typeof row && null !== row && 'undefined' !== typeof column && null !== column ) {
			Private.data.cell.remove( table_id, row, column, on_success, on_error );
		} else if( 'undefined' !== typeof row && null !== row) {
			Private.data.row.remove( table_id, row, on_success, on_error );
		} else if( 'undefined' !== typeof column && null !== column ) {
			Private.data.column.remove( table_id, column, on_success, on_error );
		} else {
			Private.data.table.remove( table_id, on_success, on_error );
		}
		return Public.prototype;
	};

	Public.prototype.delay = function( milliseconds ) {
		var id = current_table;
		if( 'undefined' === typeof tables[ id ] ) {
			tables[ id ] = {};
		}
		tables[ id ].delay = true;
		if( 'number' === typeof milliseconds ) {
			setTimeout( Public.prototype.commit, milliseconds );
		}
		return Public.prototype;
	};

	Public.prototype.cancel = function( milliseconds ) {
		tables[ id ].delay = false;
		console.log( 'cancel', current_table, arguments );
		return Public.prototype;
	};

	Public.prototype.commit = function() {
		var id = current_table;
		if( 'undefined' !== typeof tables[ id ] && true === tables[ id ].delay  ) {
			if( 'undefined' !== typeof tables[ id ].queue ) {
				for( var attr in tables[ id ].queue ) {
					Gable( id ).draw( tables[ id ].queue[ attr ] );
				}
				tables[ id ].queue = {};
			}

			tables[ id ].delay = false;
		}

		return Public.prototype;
	};

	Public.prototype.find = function() {
		console.log( 'find', current_table, arguments );

		var find_id = arguments[ 0 ]
		  , find_ids
		  , table_id = current_table
		  , find_result
		  , types = null;
		var Find = function() {
			if( 'string' === typeof find_id ) {
				find_ids = [ find_id ];
			} else if( 'object' === typeof find_id ) {
				if( Private.utils.isArray( find_id ) ) {
					//
					find_ids = find_id;
				} else if( find_id instanceof Date ) {
					//
					find_ids = [ find_id ];
				} else {	
					find_ids = [ find_id.id ];
					types = find_id.types;
				}
			}
			//looks like { 'row': int, 'column': int, 'value': value } 
			find_result = Private.utils.find( table_id, find_ids, types );
		};

		Find.prototype.dump = function() {
			var req = arguments[ 0 ];
			if( !Private.utils.isArray( find_result ) ) {
				find_result = [ find_result ];
			}

			var find_item, findlen = find_result.length, x = 0;
			for( var x = 0; x < findlen; x += 1 ) {
				find_item = find_result[ x ];
				if( 'undefined' === typeof req ) {
					Public.prototype.dump( null, find_item );
				} else {
					Public.prototype.dump( req );
				}
			}
			return Find.prototype;
		};

		Find.prototype.update = function() {
			var req = arguments[ 0 ];
			if( 'undefined' === typeof req ) {
				if( 'function' === typeof req.on_error ) {
					req.on_error( req );
				}
				return Public.prototype;
			}
			if( !Private.utils.isArray( find_result ) ) {
				find_result = [ find_result ];
			}
			var x = 0, idlen = find_result.length, finditem;
			for( x = 0; x < idlen; x += 1 ) {

				find_item = find_result[ x ];

				var row = find_item.row;
				var column = find_item.column;
				var value = req.value;
				var type = req.type;
				var attr;
				var meta = req.meta;
				var id = req.id;

				if( 'undefined' === typeof id ) {
					id = find_item.value.id;
				}

				if( 'undefined' === typeof type ) {
					type = find_item.value.type;
				}

				if( 'undefined' === typeof meta ) {
					meta = find_item.value.meta;
				}

				if( 'undefined' === typeof value ) {
					if( 'undefined' !== typeof find_item.value && 'undefined' !== typeof find_item.value.value ) {
						value = find_item.value.value;
					}
				}

				var find_update_on_success = function( res ) {
					Private.charts.redraw( table_id );
					if( 'function' === typeof req.on_success ) {
						req.on_success( res );
					}
				};

				var find_update_on_error = function() {

					if( 'function' === typeof req.on_error ) {
						req.on_error();
					}
				};
 
				if( isNaN( column ) ) {
					column = null;
				}
				
				if( isNaN( row ) ) {
					row = null;
				}

				if( 'undefined' !== typeof row && null !== row && 'undefined' !== typeof column && null !== column ) {
					Private.data.cell.update( value, table_id, row, column, find_update_on_success, find_update_on_error );
				} else if( 'undefined' !== typeof row && null !== row ) {
					Private.data.row.update( value, table_id, row, id, meta, find_update_on_success, find_update_on_error );
				} else if( 'undefined' !== typeof column && null !== column ) {	
					Private.data.column.update( table_id, column, id, type, meta, find_update_on_success, find_update_on_error );
				} else {
					Private.data.table.update( value, table_id, id, meta, find_update_on_success, find_update_on_error );
				}

			}

			return Find.prototype;
		};

		Find.prototype.get = function() {
			var req = arguments[ 0 ];
			if( 'undefined' === typeof req ) {
				if( Private.utils.isArray( find_result ) ) {
					return find_result;
				} 
				return find_result.value;
			} else {	
				if( 'undefined' !== typeof req.on_success ) {
					req.on_success( find_result );
				}
			}
			return Find.prototype;

		};

		Find.prototype.remove = function() {
			var req = arguments[ 0 ];
			if( 'undefined' === typeof find_id ) {
				if( 'function' === typeof req.on_error ) {
					req.on_error( req );
				}
				return Public.prototype;
			}
			if( !Private.utils.isArray( find_result ) ) {
				find_result = [ find_result ];
			}
			var x = 0, idlen = find_result.length, finditem;
			for( x = 0; x < idlen; x += 1 ) {
				find_item = find_result[ x ];
				var row = find_item.row;
				var column = find_item.column;
				var value = find_item.value;

				var on_success = function( res ) {
					Private.charts.redraw( table_id );
					if( 'undefined' !== typeof req && 'function' === typeof req.on_success ) {
						req.on_success( res );

					}
				};

				var on_error = function() {

					if( 'undefined' !== typeof req && 'function' === typeof req.on_error ) {
						req.on_error();
					}
				};

				if( isNaN( column ) ) {
					column = null;
				}
				
				if( isNaN( row ) ) {
					row = null;
				}

				if( 'undefined' !== typeof row && null !== row && 'undefined' !== typeof column && null !== column ) {
					Private.data.cell.remove( table_id, row, column, on_success, on_error );
				} else if( 'undefined' !== typeof row && null !== row ) {
					Private.data.row.remove( table_id, row, on_success, on_error );
				} else if( 'undefined' !== typeof column && null !== column ) {	
					Private.data.column.remove( table_id, column, on_success, on_error );
				} else {
					Private.data.table.remove( table_id, on_success, on_error );
				}

			}

			return Public.prototype;
		};

		return new Find();
	};


	//PRIVATE TO DO: load google script based on type rendering


	/* Private */
	/* Goal: 1) Transform semi-structured JS objects into CSV and the standard Google Data Table object format, making it usable w/the Google Chart API. 2) Use the ChartWrapper class to create standard chart types (http://code.google.com/apis/chart/interactive/docs/reference.html#chartwrapperobject) based on Google Data Tables. 
	*/

	var Private = {};
	Private.cache = Private.cache || {};
	Private.utils = Private.utils || {};
	Private.data = Private.data || {};
	Private.data.utils = Private.data.utils || {};
	Private.data.type = Private.data.type || {};
	Private.data.types = Private.data.types || {};
	Private.data.value = Private.data.value || {};
	Private.data.values = Private.data.values || {};
	Private.data.table = Private.data.table || {};
	Private.data.row = Private.data.row || {};
	Private.data.column = Private.data.column || {};
	Private.data.cell = Private.data.cell || {};
	Private.chart = Private.chart || {};
	Private.charts = Private.charts || {};

	Private.tmp_context = {};

	Private.utils.find = function( table_id, find_ids ) {
		var results = [];
		if( 'string' === typeof find_ids ) {
			find_ids = [ find_ids ];
		}
		if( 'undefined' !== typeof Private.cache[ table_id ] ) {

			var table = Private.cache[ table_id ];
			console.log('utils.find',table_id, find_ids, table );
			var context = [];

			if( !Private.utils.isArray( table.rows ) || !Private.utils.isArray( table.columns ) ) {
				console.log('bailing from find',table);
				return null;
			} else {

				var a, b
			          , findlen;
				var rows = table.rows
				  , rowlen = rows.length;
				var cols = table.columns
				  , collen = cols.length;
			
				if( !Private.utils.isArray( find_ids ) ) {
					return null;	
				} else {
			        	findlen = find_ids.length;
				}
				
				for( a = 0; a < findlen; a += 1 ) {
					var find_id = find_ids[ a ];
					var x, row, col;
					for( x = 0; x < collen; x += 1 ) {
						col = cols[ x ];
						if( null !== col && find_id === col.id ) {
							results.push( { 'column': x, 'type': 'column', 'value': col } );
							context.push( col );
						}	
					}
					for( x = 0; x < rowlen; x += 1 ) {
						row = rows[ x ];
						if( null !== row && find_id === row.id ) {
							results.push( { 'row': x, 'type': 'row', 'value': row } );
							context.push( row );
						}	
					}	
				}
			}
		}	

		Private.tmp_context = ( 1 === context.length ) ? context[ 0 ] : context;
		return ( 1 === results.length ) ? results[ 0 ] : results;
	};

	Private.charts.redraw = function( id ) {
		var req;
		if( 'undefined' !== typeof charts[ id ] ) {
			for( var target in charts[ id ] ) {
				req = charts[ id ][ target ];
				if( 'undefined' === typeof tables[ id ] || ( 'undefined' !== typeof tables[ id ] && tables[ id ].delay !== true ) ) {
					Public( id ).draw( req );
				} else if( tables[ id ].delay === true ) {
					if( 'undefined' === typeof tables[ id ].queue ) {
						tables[ id ].queue = {};
					}
					tables[ id ].queue[ target ] = req;
				}
			}
		}
	}

	Private.utils.clone  = function ( obj ) {
		var clone = {};
		var num = 0;
		if( 'number' === typeof obj ) {
			return num + obj;
		}
		if( 'string' === typeof obj ) {
			return '' + obj;
		}
		if( obj instanceof Date ) {
			return new Date( obj );
		}
		if( Private.utils.isArray( obj ) ) {
			return obj.slice(0);
		}
		for( var x in obj ) {
			if( "object" === typeof obj[ x ] ) {
				clone[ x ] = Private.utils.clone( obj[ x ] );
			} else {
				clone[ x ] = obj[ x ];
			}
		}
		return clone;
	};

	Private.utils.loadVisualizationAPI = function( request ) {

    var script = document.createElement( 'script' );
    	script.src = 'http://www.google.com/jsapi';
        script.type = "text/javascript";

        script.onload = function() { 
            if ( ! script.onloadDone ) {
                script.onloadDone = true; 
		if( 'undefined' !== typeof request && 'function' === typeof request.on_success ) {
			request.on_success();
		}
            }
        };
        script.onreadystatechange = function() { 
            if ( ( "loaded" === script.readyState || "complete" === script.readyState ) && ! script.onloadDone ) {
                script.onloadDone = true; 
		if( 'undefined' !== typeof request && 'function' === typeof request.on_success ) {
			request.on_success();
		}
            }
        }

    	var headID = document.getElementsByTagName("head")[0];         
	headID.appendChild(script);

	};

	Private.charts.loaded = [];
	Private.utils.chartType = function( type_id ) {
		if( 'line' === type_id ) {
			return 'corechart';
		} else if( 'pie' === type_id ) {
			return 'corechart';
		} else if( 'scatter' === type_id ) {
			return 'corechart';
		} else if( 'gauge' === type_id ) {
			return 'gauge';
		} else if( 'geo' === type_id ) {
			return 'geochart';
		} else if( 'table' === type_id ) {
			return 'table';
		} else if( 'treemap' === type_id ) {
			return 'treemap';
		} else if( 'candlestick' === type_id ) {
			return 'corechart';
		} else if( 'bar' === type_id ) {
			return 'corechart';
		} else if( 'area' === type_id ) {
			return 'corechart';
		} else if( 'column' === type_id ) {
			return 'corechart';
		} else if( 'combo' === type_id ) {
			return 'corechart';
		} else {
			return null;
		}
	};

	Private.utils.chartTypeIsLoaded = function( chart_type ) {
		if( -1 === Private.charts.loaded.indexOf( chart_type ) ) {
			return false;
		} else {
			return true;
		}
	};

	Private.utils.loadChartType = function( chart_type, on_success ) {

		if( !Private.utils.chartTypeIsLoaded( chart_type ) ) {	
			google.load( "visualization", "1", { callback: function() { if( 'function' === typeof on_success ) {
				on_success();
				Private.charts.loaded.push( chart_type );
 } }, packages: [ chart_type ] } );

		} 
		return null;
	};
	/* CONFIG */

	/* Data Types */

	Private.data.types = {
	    'table': {
	        'transform': {
	            'raw': function() {},
	        },
	        'validate': function() {}
	    },
	    'input': {
	        'transform': {
	            'raw': function() {},
	        },
	        'validate': function() {}
	    },
	    'raw': {
	        'transform': {
	            'table': function() {},
	            'csv': function() {}
	        },
	        'validate': function() {}
	    },
	    'csv': {
	        'transform': {
	            'raw': function() {},
	        },
	        'validate': function() {}	
	    }
	};

	Private.data.types.raw = Private.data.types.raw || {};
	Private.data.types.raw.transform = Private.data.types.raw.transform || {};
	Private.data.types.raw.transform.table = function( obj ) {

		if( null === obj || 'undefined' === typeof obj || 'undefined' === typeof obj.rows || 'undefined' === typeof obj.columns ) {
			obj.format = 'raw';
			return obj;
		} 
		var newcols = [];
		var newrows = [];
		var meta = obj.meta;
		var x
		  , columns = obj.columns
		  , colcount = columns.length
		  , rows = obj.rows
		  , rowcount = rows.length
		  , item;

		for( x = 0; x < colcount; x += 1 ) {
			
			item = columns[ x ];
			
			var addition = {};
			
			if( 'undefined' !== typeof item.id && null !== item.id ) {
				addition[ 'id' ] = item.id;
				addition[ 'label' ] = item.id;
			}

			if( 'undefined' !== typeof item.meta && 'undefined' !== typeof item.meta.label ) {
				delete item.meta.label;
			}

			if( 'undefined' !== typeof item.meta && 'undefined' !== typeof item.meta.label && null !== item.meta.label ) {
				addition[ 'label' ] = item.meta.label;
			} else {
				if( 'undefined' === typeof addition[ 'label' ] ) {
					addition[ 'label' ] = '';
				}
			}

			if( 'undefined' !== typeof item.meta && !Private.utils.isEmpty( item.meta ) ) {
				addition[ 'p' ] = item.meta;
			}

			if( 'undefined' !== typeof item.type && null !== item.type ) {
				addition[ 'type' ] = item.type;
			}

			newcols.push( addition );

		}

		for( x = 0; x < rowcount; x += 1 ) {

			item = rows[ x ];
			if( null !== item && 'undefined' !== typeof item && null !== item.value ) {
				var colcells = [];
				
				if( Private.utils.isArray( item.value ) ) {
					var z, arrlen = item.value.length;
					for( z = 0; z < arrlen; z += 1 ) {
						if( 'undefined' !== typeof item.value && null !== item.value ) {

							var addition = {};

							if( 'undefined' !== typeof item.meta && 'undefined' !== typeof item.meta.label && null !== item.meta.label ) {
								addition[ 'f' ] = item.meta.label;
							}
			
							if( 'undefined' !== typeof item.meta && 'undefined' !== typeof item.meta.label ) {
								delete item.meta.label;
							}

							if( 'undefined' !== typeof item.meta && !Private.utils.isEmpty( item.meta ) ) {
								addition[ 'p' ] = item.meta;
							}

							addition[ 'v' ] = item.value[  z ];
							colcells.push( addition );
						}
					}	
				
				}

				newrows.push( { 'c': colcells } );
			}
		}
		var newobj = {
			'cols': newcols
			, 'rows': newrows
		};
		if( !Private.utils.isEmpty( meta ) ) {
			newobj[ 'p' ] = meta;
		}

		return newobj;

	};

	Private.data.types.input = Private.data.types.input || {};
	Private.data.types.input.transform = Private.data.types.input.transform || {};
	Private.data.types.input.transform.raw = function(value, table_id, table) {
	 	column_meta = {};
		var columns = [];
		var isarray = Private.utils.isArray(value);
		if ( false === isarray && 'object' === typeof value ) {
			columns = Private.data.types.input.transform.iterateObjectColumns( value );
			rows = Private.data.types.input.transform.iterateObjectRows( value );
		} else if( true === isarray && 'object' === typeof value ) {
			columns = Private.data.types.input.transform.iterateArrayColumns( value );
			rows = Private.data.types.input.transform.iterateArrayRows( value );

		} else {
			//shouldn't happen but what if
		}
		
		return { 'rows': rows, 'columns': columns };
	};

	Private.data.types.input.transform.iterateObjectColumns = function(value) {
		var columns = [];
		if (!Private.utils.isArray(value)) {
			var biggest = null;
			var biggest_total = 0;
			var fallback = {};
			var big_flag = true;
			var haveId = false;

			//set column_id if data is keyed object, null
			for (var attr in value) {
				var hasId = false;
				var maybe_biggest = false;
				if (Private.utils.isArray(value[attr])) {
					var valuelen = value[ attr ].length;
					var nonulls = true;
					for( var x = 0; x < valuelen; x += 1 ) {
						if( null !== value[ attr ][ x ] && 'object' === typeof value[ attr ][ x ]  && !Private.utils.isArray( value[ attr ][ x ] ) && !( value[ attr ][ x ] instanceof Date ) ) { 
							valuelen = 0;
							for( var attr2 in value[ attr ][ x ] ) {
								if( null === value[ attr ][ x ][ attr2 ] ) {
									nonulls = false;
								}
								if ( null !== value[attr] && 'object' === typeof value[ attr ]  && !( value[ attr ] instanceof Date ) ) {
									for( var attr3 in value[attr] ) {
										if( value[attr].hasOwnProperty(attr3) ) {
											valuelen++;
											hasId = true;
										}
									}
								} else {
									valuelen++;
								}
							}
						} else if( null === value[ attr ][ x ] ) {
							nonulls = false;
							valuelen++;
						}
					}
					if( null === biggest || ( true === nonulls && ( ( valuelen >= biggest_total && true === hasId ) || ( valuelen > biggest_total && true === haveId ) ) ) ) {
						biggest = value[attr];
						if( 'undefined' !== typeof value[attr].id || 'object' === typeof value[attr] ) {
							if( !Private.utils.isArray( value[attr] ) ) {
								haveId = true;
							} else {
								if('object' === typeof value[attr][0] && !Private.utils.isArray( value[attr][0] ) ) {
									haveId = true;
								}
							}
						}
						biggest_total = valuelen;
					}
				} else if( null !== value[attr] && 'object' === typeof value[ attr ]  && !( value[ attr ] instanceof Date ) ) {
					return Private.data.types.input.transform.iterateObjectColumns(value[attr]);
					/*var newcols = Private.data.types.input.transform.iterateObjectColumns(value[attr]);
					for( var x = 0; x < newcols.length; x += 1 ) {
						columns.push( newcols[ x ] );
					}*/
				} else {
					big_flag = false;
					var val = value[attr];
					var column_id = attr;
					var column_type = Private.data.column.type(val);
					var col = Private.data.column.create(column_type, column_id, column_meta);
					columns.push(col);
				}
			}
			if( true === big_flag ) {
				var column_id = null;
				var column_type = null;
				if (Private.utils.isArray(biggest)) {
					var valuelen = biggest.length;
					for (var x = 0; x < valuelen; x += 1) {
						var val = biggest[x];
						if (null !== val && 'object' === typeof val && !( val instanceof Date ) && !Private.utils.isArray(val)) {
							return Private.data.types.input.transform.iterateObjectColumns(val, attr);
						}
						column_type = Private.data.column.type(val);	
						var col = Private.data.column.create(column_type, column_id, column_meta);
						columns.push(col);
					}
				}
			}

			return columns;
		} else {
			return Private.data.types.input.transform.iterateArrayColumns( value );
		}
		return null;
	};

	Private.data.types.input.transform.iterateArrayColumns = function(value) {
	 	var column_meta = {};
		var columns = [];
		if (Private.utils.isArray(value)) {	
			var valuelen = value.length;
			for (var x = 0; x < valuelen; x += 1) {
				var column_id = null;
				var val = value[x];
				var column_type = Private.data.column.type(val);
				if( 'undefined' === typeof column_type || null === column_type && 'object' === typeof val ) {
					return Private.data.types.input.transform.iterateObjectColumns( val );
				}
				var col = Private.data.column.create(column_type, column_id, column_meta);
				columns.push(col);
			}

		} else {

			return Private.data.types.input.transform.iterateObjectColumns( value );
		}
		return columns;
	};


	Private.data.types.input.transform.iterateObjectRows = function(value, row_id ) {
		var rows = [];
		var do_value = false;
		if (!Private.utils.isArray(value)) {
			//set row_id if data is keyed object, null
			for (var attr in value) {
				if (Private.utils.isArray(value[attr])) {
					var valuelen = value[ attr ].length;
					var wasarray = false;
					var tmpstack = [];
					for( var w = 0; w < valuelen; w += 1 ) {
						var val = value[attr][ w ];
						row_id = attr;
						var row_meta = {};
						if( null !== val && 'object' === typeof val && !( val instanceof Date ) && !Private.utils.isArray( val ) ) {
							var tmp_val = [];
							for( var attr2 in val ) {
								if( val.hasOwnProperty(attr2) ) {
									tmp_val.push( val[attr2] );
								}
							}
							//if( tmp_val.length === 1 && tmpstack.length > 0 ) {
							//	tmpstack.push( val[ 0 ] );
							//} else {
								val = tmp_val;
								var rw = Private.data.row.create(val, row_meta, row_id);
								rows.push(rw);
							//}
						} else {

							wasarray = true;
							tmpstack.push( val );

						}
					}
					if( true === wasarray ) {
						var rw = Private.data.row.create( tmpstack, row_meta, row_id);
						if( tmpstack.length > 0 ) {
							rows.push(rw);
						}
					}

				} else if( null !== value[attr] && 'object' === typeof value[ attr ] && !(  value[ attr ] instanceof Date ) ) {
					var newrows = Private.data.types.input.transform.iterateObjectRows(value[attr], attr );
					for( var x = 0; x < newrows.length; x += 1 ) {
						
						var rw = Private.data.row.create( newrows[x], row_meta, row_id);
						rows.push( rw );
					}
				} else {
					do_value = true;
				}
			}
			if( true === do_value ) {
				var val = [];
				for( var attr in value ) {
					val.push( value[attr] );
				}
				var row_meta = {};
				if( val.length > 0 ) {
					var rw = Private.data.row.create(val, row_meta, row_id);
					rows.push(rw);
				}
			}
			return rows;
		} else {

			if( true === Private.utils.isArray( value ) && 'object' !== typeof val[ 0 ] && !Private.utils.isArray( value[ 0 ] ) && !( value[0] instanceof Date ) ) {
				tmpstack = [];
				for( var attrz in value ) {
					if( value.hasOwnProperty( attrz ) ) {
						tmpstack.push( value[ attrz ] );	
					}
				}	
				if( tmpstack.length > 0 ) {
					var rw = Private.data.row.create( tmpstack, row_meta, row_id );
					rows.push(rw);
				}
			} else {
				return Private.data.types.input.transform.iterateArrayRows( value );
			}
		}
		return null;
	};

	Private.data.types.input.transform.iterateArrayRows = function(value,row_id) {
	 	var row_meta = {};
		var rows = [];
		if( 'undefined' === typeof row_id ) {
			row_id = null;
		}
		if (Private.utils.isArray(value)) {	
			var valuelen = value.length;
			var wasarray = false;
			var tmpstack = [];
			for (var x = 0; x < valuelen; x += 1) {
				var val = value[x];
				if(  'object' === typeof val ) {
					if( Private.utils.isArray(val) ) {
						
						var values = ( 'undefined' !== typeof val && null !== Private.data.column.type( val ) && !( Private.utils.isArray( val ) ) ) ? true : false;
						if( true === values ) {
							var rw = Private.data.row.create( val, row_meta, row_id );
							rows.push(rw);
						} else {
							//return Private.data.types.input.transform.iterateArrayRows( value );

						for( var y = 0; y < val.length; y += 1 ) {
							if( Private.utils.isArray(val[y]) ) {
								for( var z = 0; z < val[y].length; z += 1 ) {
									var rw;	
									if( 'object' === typeof val[ y ][ z] && !Private.utils.isArray( val[y][ z ] ) && !( val[y][ z ] instanceof Date ) ) {
										tmpstack = [];
										for( var attrz in val[y][ z ] ) {
											if( val[y][ z ].hasOwnProperty( attrz ) ) {
												tmpstack.push( val[y][ attrz ] );	
											}
										}

										rw = Private.data.row.create( tmpstack, row_meta, row_id );
										if( tmpstack.length > 0 ) {
											rows.push(rw);
											tmpstack = [];

										}
									} else {
										rw = Private.data.row.create( val[y][z], row_meta, row_id );
										rows.push(rw);
									}

								}

							} else if( 'object' === typeof val[y] && !( val[y] instanceof Date ) ) {
								var colatters = [];
								for( var zattr in val[y] ) {
									if( val[y].hasOwnProperty( zattr ) ) {
										colatters.push( val[y][zattr] );
									}
								}
								if( colatters.length > 1 ) {
									var rw = Private.data.row.create( colatters, row_meta, row_id );
									rows.push(rw);
								} else {
									tmpstack.push( colatters[0] );
								}

							} else {
								tmpstack.push( val[y] );
								wasarray = true;
							}
						}

							if( true === wasarray && tmpstack.length > 0 ) {
								var rw = Private.data.row.create( tmpstack, row_meta, row_id );
								rows.push(rw);
								tmpstack = [];

							}
						}
						
					} else {
						//
				
						var rw;	
						if( !( val instanceof Date ) ) {
							tmpstack = [];
							for( var attrz in val ) {
								if( val.hasOwnProperty( attrz ) ) {
									tmpstack.push( val[ attrz ] );	
								}
							}

							rw = Private.data.row.create( tmpstack, row_meta, row_id );
							if( tmpstack.length > 0 ) {
								rows.push(rw);
								tmpstack = [];
							}
						} else {
							rw = Private.data.row.create( val, row_meta, row_id );
							rows.push(rw);
						}

	}
				} else {
					var rw = Private.data.row.create( val, row_meta, row_id );
					rows.push(rw);
				}

			}

			if( true === wasarray ) {
				var rw = Private.data.row.create( tmpstack, row_meta, row_id);
				if( tmpstack.length > 0 ) {
					rows.push(rw);
					tmpstack = [];
				}
			}

		} else {

			return Private.data.types.input.transform.iterateObjectRows( value );
		}
		return rows;
	};



	Private.data.types.raw.transform.csv = function( obj ) {

		var type, newobj = null;

		if( 'undefined' !== typeof obj ) {

			if( 'undefined' !== typeof obj.type ) {

				type = 'column';

			} else if( 'undefined' !== typeof obj.value ) {

				type = 'row';

			} else if( 'undefined' !== typeof obj.columns && 'undefined' !== obj.rows ) {

				type = 'table';

			} else {

				on_error( { 'message': 'Not a recognized CSV data structure.' } );

			}

			if( 'column' === type ) {

				on_error( { 'message': 'A column cannot be turned into a complete CSV file.' } );

			} else if( 'row' === type ) {

				newobj = '';
				var x = 0, len = obj.value.length, item;
				for( x = 0; x < len; x += 1 ) {
					newobj = ( newobj + ( ( 0 !== x ) ? ', ' : '' ) );
					var v = obj.value[ x ];
					if( 'string' === typeof v ) {
						newobj = newobj + '"' + v.replace('"', '\"' ) + '"';
					} else if( v instanceof Date ) {

						newobj = newobj + '"' + v.toString() + '"';
					} else {

						newobj = newobj + v;
					}
					if( x === ( len - 1 ) ) {
						newobj = newobj + "\n";
					}
				}
			} else if ( 'table' === type ) {

				var x = 0, len = obj.columns.length, item, ids = [], hasHeader = false;
				newobj = '';
				for( x = 0; x < len; x += 1 ) {
					item = obj.columns[ x ];
					if( null !== item.id && 'undefined' !== item.id ) {
						ids.push( item.id );
						hasHeader = true;
					} else {
						ids.push( '' );
					}
				}
				if( true === hasHeader ) {
					var headerstr = '', y = 0; idlen = ids.length;
					for( y = 0; y < idlen; y += 1 ) {
						var v = obj.columns[ y ].meta.label || obj.columns[ y ].id || '';
						newobj = ( newobj + ( ( 0 !== y ) ? ', ' : '' ) );
						if( 'string' === typeof v && '' !== v ) {
							newobj = newobj + '"' + v.replace('"', '\"' ) + '"';
						} else if( v instanceof Date ) {

							newobj = newobj + '"' + v.toString() + '"';
						} else {

							newobj = newobj + v;
						}


					}
					newobj = newobj + headerstr + "\n";
				}
				len = obj.rows.length;//recycled
				for( x = 0; x < len; x += 1 ) {

					var rwitems = obj.rows[ x ].value, a = 0, rwlen = rwitems.length, rwitem;
					for( a = 0; a < rwlen; a += 1 ) {
				
						newobj = ( newobj + ( ( 0 !== a ) ? ', ' : '' ) );
						var v = rwitems[ a ];
						
						if( 'string' === typeof v && '' !== v ) {
							newobj = newobj + '"' + v.replace('"', '\"' ) + '"';
						} else if( v instanceof Date ) {

							newobj = newobj + '"' + v.toString() + '"';
						} else {

							newobj = newobj + v;
						}
						if( a === ( rwlen - 1 ) ) {
							newobj = newobj + "\n";
						}
					}
					if( x !== ( len - 1 ) ) {
						//newobj = newobj + "\n";
					}
				}


			}

		}
		return newobj;
	};

	Private.data.types.csv.transform.filter = function(obj) {
		return obj;
	};

	Private.data.types.table.transform.filter = function(obj) {
		return obj;
	};

	Private.data.types.raw.transform.filter = function(obj) {
	    var newobj = (null !== obj && 'undefined' !== typeof obj) ? obj : {},
	        objlen = obj.length,
	        x, current, attr;
	    if (Private.utils.isArray(obj)) {
		/*
	        //zero-indexed array
	        for (x = objlen - 1; x !== 0; x -= 1) {
	            current = obj[x];
	            //forgive non arrays by coercing them into a single item list
	            if (Private.utils.isArray(current)) {
	                newobj[x] = current;
	            } else {
	                newobj[x] = [current];
	            }
	        } */
	    } else {
	        //unique id object
	        for (attr in obj) {
	            if (obj.hasOwnProperty(attr)) {
	                current = obj[attr];
	                if (Private.utils.isArray(current)) {
	                    newobj[attr] = current;
	                } else {
	                    newobj[attr] = [current];
	                }
	            }
	        };
	    }
	    return newobj;
	};

	Private.data.types.raw.transform.validate = function(obj) {

	};


	/* type utilities */

	/* gets a type; generic */
	/* returns type object else null if undefined */
	Private.data.type.get = function(type) {
	    var types = Private.data.types[type];
	    return ('undefined' !== typeof types) ? types : null;
	};

	/* sets a type; generic */
	/* returns false if doesn't validate, else true */
	Private.data.type.set = function(type, obj) {
	    //TODO: if has a validate method, use it
	    if (Private.data.type.validate(type, obj)) {
	        Private.data.types[type] = obj;
	        return true;
	    }
	    return false;
	};

	/* updates invidiual attributes of a type; generic */
	/* returns value of Private.data.type.set */
	Private.data.type.update = function(type, attrs) {
	    var typeobj = Private.data.type.get(type);
	    for (var attr in attrs) {
	        typeobj[attr] = attrs[attr];
	    }
	    return Private.data.type.set(type, typeobj);
	};

	/* type transformsFrom other_type if other_type transformsTo type */
	/* returns inverse of Private.data.type.tranformsTo */
	//eee
	Private.data.type.tranformsFrom = function(type, other_type) {
	    //TODO: real implementation
	    return Private.data.type.tranformsTo(other_type, type);
	};

	/* returns true if a type can be converted from another type, else false */
	//ddd
	Private.data.type.tranformsTo = function(type, other_type) {
	    if ('undefined' !== typeof Private.data.types[type] && 'undefined' !== typeof Private.data.types[type]['transform'] && 'function' === typeof Private.data.types[type]['transform'][other_type]) {
	        return true;
	    }
	    return false;
	};

	/* returns  null if can't be transformed from type to other_type, else returns a transformed object of type to other_type */
	//ccc
	Private.data.type.transform = function(type, other_type, obj) {
	    if (Private.data.type.tranformsTo(type, other_type)) {
	        return Private.data.types[type]['transform'][other_type](obj);
	    }
	    return null;
	};

	/* returns true if a type can be validated, else false. note that this is different than testing whether the type object can be validated (which is always true). */
	Private.data.type.canValidate = function(type) {
	    var typeobj = Private.data.type.get(type);
	    if ('function' === typeof typeobj.validate) {
	        return true;
	    }
	    return false;
	};


	/* validates a type object (note that this is different than
	    validating an object for a type i.e. Private.data.value.validate()) */
	Private.data.type.validate = function(type, obj) {

	    // Check to see if confirms to a vaild type
	    // using a set of tests. returns false if a test fails.
	    // Well-formed (if present) methods:
	    //   obj.validate: fn 
	    //   obj.transform: { 'optional1': fn }
	    //   obj.filter: fn
	    // * Denotes required
	    if ('undefined' === typeof obj) {
	        return false;
	    }
	    if ('undefined' !== typeof obj.validate && 'function' !== typeof obj.validate) {
	        return false;
	    }
	    if ('undefined' !== typeof obj.filter && 'function' !== typeof obj.filter) {
	        return false;
	    }
	    if ('undefined' !== typeof obj.transform) {
	        for (var attr in obj.transform) {
	            if ('undefined' !== typeof obj.transform[attr] && 'function' !== typeof obj.transform[attr]) {
	                return false;
	            }
	        }
	    }

	    return true;

	};

	/* value utilities */

	/* values are composite data types made up of a type and value property. a value can also have an optional timestamp property. */

	/* returns true if an object's own types or one layer connections can convert to a type, else false */
	//aaa
	Private.data.value.transformsTo = function(obj, other_type) {
	    var type = Private.data.value.type(obj);
	    if (Private.data.type.transformsTo(type, other_type)) {
	        return true;
	    }
	    return false;
	};

	/* returns true if an object's own types or one layer connections can convert to a type, else false */
	//bbb
	Private.data.value.transformsFrom = function(obj, other_type) {
	    var type = Private.data.value.type(obj);
	    if (Private.data.type.transformsFrom(type, other_type)) {
	        return true;
	    }
	    return false;
	};

	/* returns an object converted to type */
	Private.data.value.transform = function(obj, other_type) {
	    var type = Private.data.value.type(obj);
	    return Private.data.type.transform(type, other_type, obj);
	};

	/* returns type_id for an object or null if not set */
	Private.data.value.type = function(obj) {
	    //TODO: Implementation; also: how?
	    return ('undefined' !== typeof obj.type) ? obj.type : null;
	};

	/* returns true if value is valid instance of type, else false */
	Private.data.value.isType = function(obj, type) {
	    if (type === Private.data.value.type(obj)) {
	        return true;
	    }
	    return false;
	};

	/* returns true if an object can be validated for a type, else false. note that this is different than testing whether the type object can be validated (which is always true). */
	Private.data.value.canValidate = function(obj) {
	    var type = Private.data.value.type(obj);
	    if (Private.data.type.canValidate(type)) {
	        return Private.data.value.validate(obj, type);
	    }
	};

	/* returns true if object can and does validate for a type, else false */
	Private.data.value.validate = function(obj, type) {
	    if (Private.data.value.canValidate(type)) {
	        var typeobj = Private.data.type.get(type);
	        if (typeobj.validate(obj)) {
	            return true;
	        }
	    }
	    return false;
	};


	/* Element Types */

	Private.data.elements = {
	    'table': {
	        'validate': function() {}
	    },
	    'column': {
	        'validate': function() {}
	    },
	    'row': {
	        'validate': function() {}
	    },
	    'cell': {
	        'validate': function() {}
	    }
	};

	/* Chart Types */

	Private.charts.types = {
	    'bar': {
	        'update*': function(target, table) {},
	        'remove': function(target, table) {},

	        'replace': function(target, table) {},
	        'add': function(target, table) {}
	    },
	    'pie': {
	        'update*': function(target, table) {},
	        'remove': function(target, table) {},
	        'replace': function(target, table) {},
	        'add': function(target, table) {}
	    },
	    'line': {
	        'update*': function(target, table) {},
	        'remove': function(target, table) {},
	        'replace': function(target, table) {},
	        'add': function(target, table) {}
	    }
	};


	/* Data utilities */

	Private.data.add = function( id, value, meta ) {

		meta = ( 'undefined' === typeof meta || 'object' !== typeof meta ) ? {} : meta;

		var raw = {};
		if( Private.data.type.tranformsTo( 'input', 'raw' ) ) {
			raw = Private.data.types.input.transform.raw( Private.data.types.raw.transform.filter( value ) );
		}

		var table = Private.data.table.create( raw.columns, raw.rows, meta, id );

		Private.data.table.add( table );
		
	};

	Private.data.put = function( id, value, meta ) {
		meta = ( 'undefined' === typeof meta || 'object' !== typeof meta ) ? {} : meta;
	};

	Private.data.get = function( id, type ) {
		var table = Private.data.table.get( id );
		var result = null;
		if( null === type || 'undefined' === typeof type || 'raw' === type ) {
			result = table;	
		} else if( type === 'table' ) {
			result = Private.data.types.raw.transform.table( Private.data.types.table.transform.filter( table ) );
		} else if( type === 'csv' ) {
			result = Private.data.types.raw.transform.csv( Private.data.types.csv.transform.filter( table ) );
		}
		return result;
	};

	Private.data.remove = function( id ) {

	};

	Private.data.update = function( id, value, meta ) {
		meta = ( 'undefined' === typeof meta || 'object' !== typeof meta ) ? {} : meta;

		var raw = {};
		if( Private.data.type.tranformsTo( 'input', 'raw' ) ) {
			raw = Private.data.types.input.transform.raw( Private.data.types.raw.transform.filter( value ) );
		}

		var table = Private.data.table.create( raw.columns, raw.rows, meta, id );
		Private.data.table.update( table );
		
	};


	/* Chart utilities */

	Private.charts.add = function(type, target) {

	};

	Private.charts.type = function(target) {

	};

	Private.charts.exists = function(id) {

	};

	Private.charts.remove = function(id) {

	};

	//Create

	/* returns a well formatted data object for data type or null if there was some sort of error. columns and rows are arrays of column and row objects, respectively.  */
	Private.data.table.create = function( columns, rows, meta, id, timestamp ) {
		//columns are rows are required
		if( 'undefined' === typeof columns || 'undefined' === typeof rows ||  null === columns || null === rows ) {
			return null;	
		} else {
			//columns and rows are formatted as arrays in raw
			if( !Private.utils.isArray( columns ) || !Private.utils.isArray( rows ) ) {
				//columns and rows must be arrays
				return null;
			}
		}
		//meta is optional
		if( 'undefined' === typeof meta ) {
			meta = null;
		}
		//id is optional
		if( 'undefined' === typeof id ) {
			id = null;
		}
		//timestamp can be faked
		timestamp = ( 'number' !== typeof timestamp ) ? new Date().getTime() : timestamp;
		return { 
			'columns': columns
			, 'rows': rows
			, 'meta': meta
			, 'id': id
			, 'timestamp': timestamp
		};
	};

	Private.data.row.create = function( value, meta, id, timestamp ) {
		//value is required
		if( 'undefined' === typeof value || null === value ) {
			return null;	
		}
		//meta is optional
		if( 'undefined' === typeof meta ) {
			meta = null;
		}
		//id is optional
		if( 'undefined' === typeof id ) {
			id = null;
		}
		//timestamp can be faked
		timestamp = ( 'number' !== typeof timestamp ) ? new Date().getTime() : timestamp;
	    	return { 
	        	'value': value
			, 'id': id
			, 'meta': meta
	       		, 'timestamp': timestamp
		};
	};

	/* type is required */
	/* types: boolean, number, string, date, datetime */
	Private.data.column.types = [ 'boolean', 'number', 'string', 'date', 'datetime' ];

	//null will become a string if it has to
	Private.data.column.type = function( obj ) {
		if( null === obj ) {
			return 'string';	
		} if( 'boolean' === typeof obj ) {
			return 'boolean';
		} if( 'number' === typeof obj ) {
			return 'number';
		} if( 'string' === typeof obj ) {
			return 'string';
		} if( obj instanceof Date ) {
			if( 0 === obj.getHours() ) {
				return 'date';
			} else {
				return 'datetime';
			}	
		}
		return null;
	};

	Private.data.column.create = function( type, id, meta, timestamp ) {
		//type is required
		if( 'undefined' === typeof type ||  null === type ) {
			//no type given
			return null;
		} else {
			if( -1 === Private.data.column.types.indexOf( type ) ) {
				//not a valid type
				return null;
			}
		}
		//id is optional
		if( 'undefined' === typeof id || null === id ) {
			id = null;
		}
		//meta is optional
		if( 'undefined' === typeof meta || null === meta ) {
			meta = {};
		}
		if( 'undefined' === typeof meta.label ) {
			meta.label = null;
		}
		//timestamp can be faked
		timestamp = ( 'number' !== typeof timestamp ) ? new Date().getTime() : timestamp;
		return { 
			'type': type
			, 'id': id
	    		, 'meta': meta
			, 'timestamp': timestamp
		};
	};

	Private.data.cell.create = function( value, meta, id, timestamp) {
		//value is required
		if( 'undefined' === typeof value || null === value ) {
			//no value given
			return null;
		}
		//id is optional
		if( 'undefined' === typeof id || null === id ) {
			id = null;
		}
		//meta is optional
		if( 'undefined' === typeof meta || null === meta ) {
			meta = {};
		}
		if( 'undefined' === typeof meta.label ) {
			meta.label = null;
		}

		//timestamp can be faked
		timestamp = ( 'number' !== typeof timestamp ) ? new Date().getTime() : timestamp;

		return { 
			'value': value
			, 'id': id
	    		, 'meta': meta
			, 'timestamp': timestamp
		};
	};
	    
	Private.data.table.add = function( table ) {
		//TODO: validate table
		if( 'undefined' === typeof Private.cache[ table.id ] ) {
			Private.cache[ table.id ] = table;
		} 
	};

	Private.data.row.add = function( table_id, row ) {
		//TODO: validate row 
		var table = Private.cache[ table_id ];
		if( 'undefined' !== typeof table ) {
			Private.cache[ table_id ].rows.push( row );
		};
	};

	Private.data.column.add = function( table_id, column ) {
		//TODO: validate column 
		var table = Private.cache[ table_id ];
		if( 'undefined' !== typeof table ) {
			Private.cache[ table_id ].columns.push( columns );
		};
	};

	//Can't update a cell without adding a row or column
	//Private.data.cell.add = function() {};

	//Read
	Private.data.table.get = function( table_id, on_success, on_error ) {
		table_id = table_id;
		var val;
		if( 'undefined' !== typeof Private.cache[ table_id ] ) {
			val = Private.cache[ table_id ];
		} 
		if( 'function' === typeof on_success ) {
			on_success( val );
		}
		return val;
	};

	//allows for optional lookup by row_id, in which case row_index is ignored and can be set to null
	Private.data.row.get = function( table_id, row_index, on_success, on_error, row_id ) {
		var table = Private.cache[ table_id ]
		  , row;
		if( 'undefined' !== typeof table ) {
			if( 'undefined' !== typeof row_id ) {
				var rowlen = table.rows.length;
				for( var x = 0; x < rowlen; x += 1 ) {
					var tmp = table.rows[ x ];
					if( 'undefined' !== typeof tmp.id ) {
						if( tmp.id === row_id ) {
							Private.tmp_context = tmp;
							if( 'function' === typeof on_success ) {
								on_success( tmp );
							}
							return tmp;
						}
					}
				}
			} else {
				row = table.rows[ row_index ];
				if( 'undefined' !== typeof row ) {
					Private.tmp_context = row;
					if( 'function' === typeof on_success ) {
						on_success( row );
					}
					return row;
				}
			}
		} 
		return null;
	};
	Private.data.column.get = function( table_id, column_index, on_success, on_error, column_id) {
		var table = Private.cache[ table_id ]
		  , column;
		if( 'undefined' !== typeof table ) {
			if( 'undefined' !== typeof column_id ) {
				var collen = table.rows.length;
				for( var x = 0; x < collen; x += 1 ) {
					column = table.columns[ x ];
					if( 'undefined' !== typeof column && 'undefined' !== typeof column.id ) {
						if( column.id === column_id ) {
							
							if( 'function' === typeof on_success ) {
								on_success( column );
							}
							Private.tmp_context = column;
							return column;
						}
					}
				}
			} else {
				column = table.columns[ column_index ];
				if( 'undefined' !== typeof column ) {
					Private.tmp_context = column;
					if( 'function' === typeof on_success ) {
						on_success( column );
					}
				}
			}
		} 
		return null;
	};

	Private.data.cell.get = function( table_id, row_index, column_index, on_success, on_error, row_id, column_id ) {
		var table = Private.cache[ table_id ]
		  , column, row, value;
		if( 'undefined' !== typeof table ) {
			if( 'undefined' !== typeof row_id ) {
				var rowlen = table.rows.length;
				for( var x = 0; x < rowlen; x += 1 ) {
					var tmp = table.rows[ x ];
					if( 'undefined' !== typeof tmp.id ) {
						if( tmp.id === row_id ) {
							row = tmp;
						}
					}
				}
			} else {
				row = table.rows[ row_index ];
			}
		} 
		if( 'undefined' !== typeof row ) {
			if( 'undefined' !== typeof column_id ) {
				var rowlen = table.rows.length;
				for( var x = 0; x < rowlen; x += 1 ) {
					var tmp = table.rows[ x ];
					if( 'undefined' !== tmp.id ) {
						if( tmp.id === column_id ) {
							value = tmp;
						}
					}
				}
			} else {
				value = row.value[ column_index ];
			}
		}
		
		Private.tmp_context = value;
		
		if( 'function' === typeof on_success ) {
			on_success( value );
		}

		return null;
	};

	//Destroy
	Private.data.destroy = function(data, id, type, format, meta,parents,children) {

	};

	Private.data.table.destroy = function( table_id, on_success, on_error ) {
		if( 'undefined' !== typeof Private.cache[ table_id ] ) {	
			delete Private.cache[ table_id ];
		} else {
			if( 'function' === typeof on_error ) {
				on_error( { 'table': table_id, 'value': newtable } );
			}
		}

		if( 'function' === typeof on_success ) {
			on_success( { 'table': table_id } );
		}

	};

	Private.data.row.destroy = function( table_id, row, on_success, on_error ) {
		//TODO: validate 
		var table = Private.cache[ table_id ];

		if( null === rable.rows[ row ] || 'undefined' !== typeof table.rows[ row ] ) {

			delete table.rows[ row ];

			if( 'function' === typeof on_success ) {
				on_success( { 'table': table_id, 'value': val, 'row': row }  );	
			}
		} else {
			if( 'function' === typeof on_error ) {
				on_error( { 'table': table_id, 'value': val, 'row': row } );	
			}
		}
	};

	Private.data.column.destroy = function( val, table_id, column, column_id, column_meta, on_success, on_error ) {
		//TODO: validate 
		var table = Private.cache[ table_id ];
		var col = table.columns[ column ];
		if( 'undefined' !== typeof col && null !== col ) {
			delete table.columns;
			if( 'function' === typeof on_success ) {
				on_success( { 'table': table_id, 'value': val, 'column': column }  );	
			} else {
				if( 'function' === typeof on_error ) {
					on_error( { 'table': table_id, 'value': val, 'column': column } );	
				}
			}

		}
	};

	Private.data.cell.destroy = function( value, table_id, row, column, on_success, on_error ) {

		//TODO: validate column 
		var table = Private.cache[ table_id ];	
		if( 'undefined' !== typeof table.rows[ row ] && 'undefined' !== typeof table.rows[ row ].value[ column ] && null !== table.rows[ row ].value[ column ] ) {
			table.rows[ row ].value[ column ];	
			if( 'function' === typeof on_success ) {
				on_success( { 'table': table_id, 'row': row, 'column': column }  );	
			}
		} else {
			if( 'function' === typeof on_error ) {
				on_error( { 'table': table_id, 'row': row, 'column': column } );	
			}
		}
	};

	//Update
	Private.data.update = function(data, id, type, format, meta,parents,children) {

	};

	Private.data.table.update = function( val, table_id, meta, on_success, on_error ) {
		//TODO: validate cell
		meta = ( 'undefined' === typeof meta || 'object' !== typeof meta ) ? {} : meta;

		var raw = {};
		if( Private.data.type.tranformsTo( 'input', 'raw' ) ) {
			raw = Private.data.types.input.transform.raw( Private.data.types.raw.transform.filter( val ) );
		}

		var newtable = Private.data.table.create( raw.columns, raw.rows, meta, table_id );

		Private.cache[ table_id ] = newtable;

		if( 'function' === typeof on_success ) {
			on_success( { 'table': table_id, 'value': newtable } );
		}


	};

	Private.data.row.update = function( val, table_id, row, row_id, row_meta, on_success, on_error ) {
		//TODO: validate row 
		var table = Private.cache[ table_id ];
/*
		var raw = {};
		if( Private.data.type.tranformsTo( 'input', 'raw' ) ) {
			raw = Private.data.types.input.transform.raw( Private.data.types.raw.transform.filter( val ) );
		}

		val = raw.rows[ 0 ];*/
		var rw = table.rows[ row ];

		if( null === rw || 'undefined' === typeof rw ) {

			if( 'function' === typeof on_error ) {
				on_error( { 'table': table_id, 'value': val, 'row': row } );	
			}

			return null;
		}
		if( null === row_id || 'undefined' === typeof row_id ) {
			row_id = rw.id;
		}
		if( null === row_meta || 'undefined' === typeof row_meta ) {
			row_meta = rw.meta;
		} else {
			for( var attr in rw.meta ) {
				if( rw.meta.hasOwnProperty( attr ) && 'undefined' !== typeof row_meta[ attr ] ) {
					row_meta[ attr ] = rw.meta[ attr ];
				}
			}
		}

		if( null === val || 'undefined' === typeof val ) {
			val = rw.value;
		}
		val = Private.data.row.create( val, row_meta, row_id );
		table.rows[ row ] = val;

		if( 'function' === typeof on_success ) {
			on_success( { 'table': table_id, 'value': val, 'row': row }  );	
		}
	
	};

	Private.data.column.update = function( table_id, column, column_id, column_type, column_meta, on_success, on_error ) {
		//TODO: validate column 
		var table = Private.cache[ table_id ];
		var col = table.columns[ column ];
		if( null === col || 'undefined' === typeof col ) {
			if( 'function' === typeof on_error ) {
				on_error( { 'table': table_id, 'value': val, 'column': column } );	
			}
			return null;
		}
/*
		var raw = {};
		if( Private.data.type.tranformsTo( 'input', 'raw' ) ) {
			raw = Private.data.types.input.transform.raw( Private.data.types.raw.transform.filter( val ) );
		}
		val = raw.columns[ 0 ];*/

		if( null === column_id || 'undefined' === typeof column_id ) {
			column_id = col.id;
		}
		if( null === column_meta || 'undefined' === typeof column_meta ) {
			column_meta = col.meta;
		} else {
			for( var attr in col.meta ) {
				if( col.meta.hasOwnProperty( attr ) && 'undefined' !== typeof column_meta[ attr ] ) {
					column_meta[ attr ] = col.meta[ attr ];
				}
			}
		}

		if( null === column_type || 'undefined' === typeof column_type ) {
			column_type = col.type;
		}
		val = Private.data.column.create(column_type, column_id, column_meta);

		table.columns[ column ]  = val;

		if( 'function' === typeof on_success ) {
			on_success( { 'table': table_id, 'value': val, 'column': column }  );	
		}


	};

	Private.data.cell.update = function( value, table_id, row, column, on_success, on_error ) {
		//TODO: validate column 
		var table = Private.cache[ table_id ];
		if( 'undefined' === typeof table ||  'undefined' === typeof table.rows[ row ] || 'undefined' === table.rows[ row ].value[ column ] ) {
			if( 'function' === typeof on_error ) {
				on_error( { 'table': table_id, 'row': row, 'column': column } );	
			}
		} else {
			table.rows[ row ].value[ column ] = value;
	
			if( 'function' === typeof on_success ) {
				on_success( { 'table': table_id, 'row': row, 'column': column }  );	
			}
		}

	};
	
	Private.data.remove = function(data, id, type, format, meta,parents,children) {

	};

	Private.data.table.remove = function( table_id, on_success, on_error ) {

		var table = Private.cache[ table_id ];

		if( 'undefined' !== typeof table ) { 
			delete Private.cache[ table_id ];
			if( 'function' === typeof on_success ) {
				on_success( { 'table': table_id } );
			}
		} else {
			if( 'function' === typeof on_error ) {
				on_error( { 'table': table_id } );
			}
		}

	};

	Private.data.row.remove = function( table_id, row, on_success, on_error, soft ) {
		//TODO: validate row 
		var table = Private.cache[ table_id ];
		if( 'undefined' !== typeof table.rows[ row ] ) {
			delete Private.cache[ table_id ].rows[ row ];
			var count = 0;
			for( var attr in Private.cache[ table_id ].rows ) {
				if( Private.cache[ table_id ].rows.hasOwnProperty( attr ) ) { 
					count++;
				}
			}
			if( Private.cache[ table_id ].rows.length < 1 && soft !== true ) {
				Private.data.table.remove( table_id, on_success, on_error );
				for( var attr in tables[ id ] ) {
					var node = document.getElementById( attr );
					node.parentNode.removeChild( node );
				}
				tables[ id ] = {};
				delete tables[ id ];
			} else {
				if( 'function' === typeof on_success ) {
					on_success( { 'table': table_id, 'row': row }  );	
				}
			}
		} else {
			if( 'function' === typeof on_error ) {
				on_error( { 'table': table_id, 'row': row } );	
			}
		}
	};

	Private.data.column.remove = function( table_id, column, on_success, on_error, soft ) {
		//TODO: validate column 

		var table = Private.cache[ table_id ];
		var col = table.columns[ column ];
		if( 'undefined' !== typeof col && 'undefined' !== typeof Private.cache[ table_id ] ) {

			Private.cache[ table_id ].columns.splice( column, 1 );
			for( var z = 0; z < table.rows.length; z += 1 ) {
				Private.cache[ table_id ].rows[ z ].value.splice( column, 1 );
			}
			if( Private.cache[ table_id ].columns.length < 1 && soft !== true ) {
				Private.data.table.remove( table_id, on_success, on_error );
				for( var attr in tables[ id ] ) {
					var node = document.getElementById( attr );
					node.parentNode.removeChild( node );
				}
				tables[ id ] = {};
				delete tables[ id ];
			} else {

				if( 'function' === typeof on_success ) {
					on_success( { 'table': table_id, 'column': column }  );	
				}
			}

		} else {
			if( 'function' === typeof on_error ) {
				on_error( { 'table': table_id, 'column': column } );	
			}
		}

	};


	Private.data.cell.remove = function( table_id, row, column, on_success, on_error ) {
	
		var table = Private.cache[ table_id ];

		if( 'undefined' !== typeof table.rows[ row ].value[ column ] ) {

			delete table.rows[ row ].value[ column ];

			if( 'function' === typeof on_success ) {
				on_success( { 'table': table_id, 'row': row, 'column': column }  );	
			}

		} else {
			if( 'function' === typeof on_error ) {

			on_error( { 'table': table_id, 'row': row, 'column': column } );	

			}
		}
	};


	/* Utilities */

	Private.utils.isArray = function(obj) {
		if( 'undefined' === typeof obj || obj === null ) {
			return false;
		}
	    if ( 'undefined' === typeof obj.isArray ) {
	        return Object.prototype.toString.call( obj ) === '[object Array]';
	    } else {
	        return obj.isArray();
	    }
	}

	Private.utils.isEmpty = function(obj) {
		for(var prop in obj) {
			if(obj.hasOwnProperty(prop)) {
				return false;
			}
		}
		return true;
	}

	/* return public API */

	return Public;

}() );
