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
		tables[ table_id ] = {};
		tables[ table_id ].delayed = false;
		tables[ table_id ].value = false;
		console.log('engaged', table_id);
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
		var res = Private.data.get( current_table );
		if( 'function' === typeof req.on_success ) {
			req.on_success( res );	
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

				if( 'undefined' !== typeof req && null !== req && req.meta ) {
					for( var attr in req.meta ) {
						if( req.meta.hasOwnProperty( attr ) ) {
							options[ attr ] = req.meta[ attr ];
						}
					}
				}
				var chart = {};
				//attempt to use table id if target not set
				//

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
		console.log( 'update', current_table, arguments );
		var req = arguments[ 0 ];
		if( 'undefined' === typeof arguments[ 0 ] ) {
			if( 'function' === typeof req.on_error ) {
				req.on_error( req );
			}
			return;
		}
		var id = current_table;
		var value = req.value;
		var row = req.row;
		var column = req.column;
		console.log('REQ',req);
		if( 'undefined' !== typeof row && 'undefined' !== typeof column ) {
			Private.data.cell.update( value, id, row, column );
		} else if( 'undefined' !== typeof row ) {
			Private.data.row.update( value, id, row );
		} else if( 'undefined' !== typeof column ) {
			Private.data.column.update( value, id, column );
		} else {
			Private.data.table.update( value, id );
		}


		if( 'function' === typeof req.on_success ) {
			req.on_success( req.id );	
		}
		return Public.prototype;
	};

	Public.prototype.dump = function() {
		console.log( 'export', current_table, arguments );
		return Public.prototype;
		//on_success
		//on_error
	};

	Public.prototype.remove = function( args ) {
		console.log( 'remove', current_table, arguments );
		return Public.prototype;
		//on_success
		//on_error
	};

	Public.prototype.delay = function( milliseconds ) {
		console.log( 'delay', current_table, arguments );
		return Public.prototype;
		//on_success
		//on_error
	};

	Public.prototype.cancel = function( milliseconds ) {
		console.log( 'cancel', current_table, arguments );
		return Public.prototype;
	};

	Public.prototype.commit = function() {
		console.log( 'commit', current_table, arguments );
		return Public.prototype;
	};

	Public.prototype.find = function() {
		console.log( 'find', current_table, arguments );
		var Find = function() {
			console.log('find',arguments);
		};

		Find.prototype.get = function() {
			console.log('get',arguments);
		};

		Find.prototype.remove = function() {
			console.log('remove',arguments);
		};

		Find.prototype.update = function() {
			console.log('update',arguments);
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
			if( "object" == typeof obj[ x ] ) {
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

		if( null === obj || 'undefined' === typeof obj ) {
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
				var valuelen = biggest.length;
				var column_id = null;
				var column_type = null;
				if (Private.utils.isArray(biggest)) {
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
							val = tmp_val;
							var rw = Private.data.row.create(val, row_meta, row_id);
							rows.push(rw);
						} else {

							wasarray = true;
							tmpstack.push( val );

						}
					}
					if( true === wasarray ) {
						var rw = Private.data.row.create( tmpstack, row_meta, row_id);
						if( tmpstack > 0 ) {
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
								var rw = Private.data.row.create( colatters, row_meta, row_id );
								rows.push(rw);

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
							if( tmpstack > 0 ) {
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
				if( tmpstack > 0 ) {
					rows.push(rw);
					tmpstack = [];
				}
			}

		} else {

			return Private.data.types.input.transform.iterateObjectRows( value );
		}
		return rows;
	};



	Private.data.types.raw.transform.csv = function(obj) {
		console.log("Transform: CSV",obj);
		return obj;
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
	        //zero-indexed array
	        for (x = objlen - 1; x !== 0; x -= 1) {
	            current = obj[x];
	            //forgive non arrays by coercing them into a single item list
	            if (Private.utils.isArray(current)) {
	                newobj[x] = current;
	            } else {
	                newobj[x] = [current];
	            }
	        }
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
	Private.data.type.tranformsFrom = function(type, other_type) {
	    //TODO: real implementation
	    return Private.data.type.tranformsTo(other_type, type);
	};

	/* returns true if a type can be converted from another type, else false */
	Private.data.type.tranformsTo = function(type, other_type) {
	    if ('undefined' !== typeof Private.data.types[type] && 'undefined' !== typeof Private.data.types[type]['transform'] && 'function' === typeof Private.data.types[type]['transform'][other_type]) {
	        return true;
	    }
	    return false;
	};

	/* returns  null if can't be transformed from type to other_type, else returns a transformed object of type to other_type */
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
	Private.data.value.transformsTo = function(obj, other_type) {
	    var type = Private.data.value.type(obj);
	    if (Private.data.value.transformsTo(type, other_type)) {
	        return true;
	    }
	    return false;
	};

	/* returns true if an object's own types or one layer connections can convert to a type, else false */
	Private.data.value.transformsFrom = function(obj, other_type) {
	    var type = Private.data.value.type(obj);
	    if (Private.data.value.transformsFrom(type, other_type)) {
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
	Private.data.table.get = function( table_id ) {
		table_id = table_id;
		console.log('getting',table_id,Private.cache[ table_id ]);
		if( 'undefined' !== typeof Private.cache[ table_id ] ) {
			return Private.cache[ table_id ];
		} 
		return null;
	};

	//allows for optional lookup by row_id, in which case row_index is ignored and can be set to null
	Private.data.row.get = function( table_id, row_index, row_id ) {
		var table = Private.cache[ table_id ]
		  , row;
		if( 'undefined' !== typeof table ) {
			if( 'undefined' !== typeof row_id ) {
				var rowlen = table.rows.length;
				for( var x = 0; x < rowlen; x += 1 ) {
					var tmp = table.rows[ x ];
					if( 'undefined' !== tmp.id ) {
						if( tmp.id === row_id ) {
							return;
						}
					}
				}
			} else {
				row = table.rows[ row_index ];
				if( 'undefined' !== typeof row ) {
					return row;
				}
			}
		} 
		return null;
	};
	Private.data.column.get = function( table_id, column_index, column_id) {
		var table = Private.cache[ table_id ]
		  , column;
		if( 'undefined' !== typeof table ) {
			if( 'undefined' !== typeof column_id ) {
				var collen = table.rows.length;
				for( var x = 0; x < collen; x += 1 ) {
					column = table.columns[ x ];
					if( 'undefined' !== columm.id ) {
						if( column.id === column_id ) {
							return column;
						}
					}
				}
			} else {
				column = table.columns[ column_index ];
				if( 'undefined' !== typeof column ) {
					return column;
				}
			}
		} 
		return null;
	};

	Private.data.cell.get = function( table_id, row_index, row_id, column_index, column_id ) {
		var table = Private.cache[ table_id ]
		  , column, row, value;
		if( 'undefined' !== typeof table ) {
			if( 'undefined' !== typeof row_id ) {
				var rowlen = table.rows.length;
				for( var x = 0; x < rowlen; x += 1 ) {
					var tmp = table.rows[ x ];
					if( 'undefined' !== tmp.id ) {
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
				value = row[ column_index ];
			}
		}
		return null;
	};
	//TODO: Next up?
	//Destroy
	Private.data.remove = function() {};
	Private.data.table.remove = function() {};
	Private.data.row.remove = function() {};
	Private.data.column.remove = function() {};
	Private.data.cell.remove = function() {};

	//Replace
	Private.data.put = function() {};
	Private.data.table.put = function() {};
	Private.data.row.put = function() {};
	Private.data.column.put = function() {};
	Private.data.cell.put = function() {};

	//Update
	Private.data.update = function(data, id, type, format, meta,parents,children) {

	};

	Private.data.table.update = function( value, table_id, row, column ) {
		//TODO: validate cell
		var table = Private.cache[ table_id ];
		Private.cache[ table.id ] = table;
	};

	Private.data.row.update = function( value, table_id, row ) {
		//TODO: validate row 
		var table = Private.cache[ table_id ];
		console.log( "ROW", table.rows[ row ] );
	};

	Private.data.column.update = function( value, table_id, column ) {
		//TODO: validate column 
		var table = Private.cache[ table_id ];
		console.log( "COLUMN", table.columns[ column ] );
	};

	Private.data.cell.update = function( value, table_id, row, column ) {
		//TODO: validate column 
		var table = Private.cache[ table_id ];
		console.log( "CELL", table.rows[ row ][ column ] );
	};



	Private.data.update.value = function() {};
	Private.data.table.update.value = function() {};
	Private.data.row.update.value = function() {};
	Private.data.column.update.value = function() {};
	Private.data.cell.update.value = function() {};

	Private.data.update.id = function() {};
	Private.data.table.update.id = function() {};
	Private.data.row.update.id = function() {};
	Private.data.column.update.id = function() {};
	Private.data.cell.update.id = function() {};

	Private.data.update.meta = function() {};
	Private.data.table.update.meta = function() {};
	Private.data.row.update.meta = function() {};
	Private.data.column.update.meta = function() {};
	Private.data.cell.update.meta = function() {};

	Private.data.update.timestamp = function() {};
	Private.data.table.update.timestamp = function() {};
	Private.data.row.update.timestamp = function() {};
	Private.data.column.update.timestamp = function() {};
	Private.data.cell.update.timestamp = function() {};

	//Draw
	Private.data.draw = function() {};
	Private.data.table.draw = function() {};
	Private.data.row.draw = function() {};
	Private.data.column.draw = function() {};
	Private.data.cell.draw = function() {};

	/* Utilities */

	Private.utils.isArray = function(obj) {
		if( obj === null ) {
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
