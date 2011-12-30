/* Gable.js */
/* Goal: 1) Transform semi-structured JS objects into CSV and the standard Google Data Table object format, making it usable w/the Google Chart API. 2) Use the ChartWrapper class to create standard chart types (http://code.google.com/apis/chart/interactive/docs/reference.html#chartwrapperobject) based on Google Data Tables. 
*/
var Gable = {};
Gable.cache = Gable.cache || {};
Gable.utils = Gable.utils || {};
Gable.data = Gable.data || {};
Gable.data.utils = Gable.data.utils || {};
Gable.data.type = Gable.data.type || {};
Gable.data.types = Gable.data.types || {};
Gable.data.value = Gable.data.value || {};
Gable.data.values = Gable.data.values || {};
Gable.data.table = Gable.data.table || {};
Gable.data.row = Gable.data.row || {};
Gable.data.column = Gable.data.column || {};
Gable.data.cell = Gable.data.cell || {};
Gable.chart = Gable.chart || {};
Gable.charts = Gable.charts || {};

/* CONFIG */

/* Data Types */

Gable.data.types = {
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

Gable.data.types.input = Gable.data.types.input || {};
Gable.data.types.input.transform = Gable.data.types.input.transform || {};
Gable.data.types.input.transform.raw = function(value, table_id, table) {
 	column_meta = {};
	var columns = [];
	var isarray = Gable.utils.isArray(value);
	if ( false === isarray && 'object' === typeof value ) {
		columns = Gable.data.types.input.transform.iterateObjectColumns( value );
		rows = Gable.data.types.input.transform.iterateObjectRows( value );
	} else if( true === isarray && 'object' === typeof value ) {
		columns = Gable.data.types.input.transform.iterateArrayColumns( value );
		rows = Gable.data.types.input.transform.iterateArrayRows( value );

	} else {
		//shouldn't happen but what if
	}
	
	return { 'rows': rows, 'columns': columns };
};

Gable.data.types.input.transform.iterateObjectColumns = function(value) {
	var columns = [];
	if (!Gable.utils.isArray(value)) {
		var biggest = null;
		var biggest_total = 0;
		var fallback = {};
		var big_flag = true;
		//set column_id if data is keyed object, null
		for (var attr in value) {
			var maybe_biggest = false;
			if (Gable.utils.isArray(value[attr])) {
				var valuelen = value[ attr ].length;
				var nonulls = true;
				if ( null !==  value[ attr ][ x ] ) {
					for( var x = 0; x < valuelen; x += 1 ) {
						if( null !== value[ attr ][ x ] && 'object' === typeof value[ attr ][ x ]  && !Gable.utils.isArray( value[ attr ][ x ] ) && !( value[ attr ][ x ] instanceof Date ) ) { 
							for( var attr2 in value[ attr ][ x ] ) {
								if( null === value[ attr ][ x ][ attr2 ] ) {
									nonulls = false;
								}
							}
						} else if( null === value[ attr ][ x ] ) {
							nonulls = false;
						}
					}
				}
				if( null === biggest || ( true === nonulls && valuelen >= biggest_total ) ) {
					biggest = value[attr];
					biggest_total = valuelen;
				}
			} else if( null !== value[attr] && 'object' === typeof value[ attr ]  && !( value[ attr ] instanceof Date ) ) {
				return Gable.data.types.input.transform.iterateObjectColumns(value[attr]);
				/*var newcols = Gable.data.types.input.transform.iterateObjectColumns(value[attr]);
				for( var x = 0; x < newcols.length; x += 1 ) {
					columns.push( newcols[ x ] );
				}*/
			} else {
				big_flag = false;
				var val = value[attr];
				var column_id = attr;
				var column_type = Gable.data.column.type(val);
				var col = Gable.data.column.create(column_type, column_id, column_meta);
				columns.push(col);
			}
		}
		if( true === big_flag ) {
			var valuelen = biggest.length;
			var column_id = null;
			var column_type = null;
			if (Gable.utils.isArray(biggest)) {
				for (var x = 0; x < valuelen; x += 1) {
					var val = biggest[x];
					if (null !== val && 'object' === typeof val && !( val instanceof Date ) && !Gable.utils.isArray(val)) {
						return Gable.data.types.input.transform.iterateObjectColumns(val, attr);
					}
					column_type = Gable.data.column.type(val);	
					var col = Gable.data.column.create(column_type, column_id, column_meta);
					columns.push(col);
				}
			}
		}

		return columns;
	} else {
		return Gable.data.types.input.transform.iterateArrayColumns( value );
	}
	return null;
};

Gable.data.types.input.transform.iterateArrayColumns = function(value) {
 	var column_meta = {};
	var columns = [];
	if (Gable.utils.isArray(value)) {	
		var valuelen = value.length;
		for (var x = 0; x < valuelen; x += 1) {
			var column_id = null;
			var val = value[x];
			var column_type = Gable.data.column.type(val);
			if( 'undefined' === typeof column_type || null === column_type && 'object' === typeof val ) {
				return Gable.data.types.input.transform.iterateObjectColumns( val );
			}
			var col = Gable.data.column.create(column_type, column_id, column_meta);
			columns.push(col);
		}

	} else {

		return Gable.data.types.input.transform.iterateObjectColumns( value );
	}
	return columns;
};


Gable.data.types.input.transform.iterateObjectRows = function(value, row_id ) {
	var rows = [];
	var do_value = false;
	if (!Gable.utils.isArray(value)) {
		//set row_id if data is keyed object, null
		for (var attr in value) {
			if (Gable.utils.isArray(value[attr])) {
				var valuelen = value[ attr ].length;
				var val = value[attr];
				row_id = attr;
				var row_meta = {};
				var rw = Gable.data.row.create(val, row_meta, row_id);
				rows.push(rw);
			} else if( null !== value[attr] && 'object' === typeof value[ attr ] && !(  value[ attr ] instanceof Date ) ) {
				var newrows = Gable.data.types.input.transform.iterateObjectRows(value[attr], attr );
				for( var x = 0; x < newrows.length; x += 1 ) {
					rows.push( newrows[ x ] );
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
			var rw = Gable.data.row.create(val, row_meta, row_id);
			rows.push(rw);
		}
		return rows;
	} else {
		return Gable.data.types.input.transform.iterateArrayRows( value );
	}
	return null;
};

Gable.data.types.input.transform.iterateArrayRows = function(value,row_id) {
 	var row_meta = {};
	var rows = [];
	if (Gable.utils.isArray(value)) {	
		var valuelen = value.length;
		for (var x = 0; x < valuelen; x += 1) {
			var val = value[x];
			if(  'object' === typeof val ) {
				if( Gable.utils.isArray(value) ) {
					return Gable.data.types.input.transform.iterateArrayRows( val );

				} else {
					return Gable.data.types.input.transform.iterateObjectRows( val );

				}
			}
			var rw = Gable.data.row.create( val, row_meta, row_id );
			rows.push(rw);
		}

	} else {

		return Gable.data.types.input.transform.iterateArrayRows( value );
	}
	return rows;
};



Gable.data.types.raw.transform.csv = function(obj) {
	return obj;
};

Gable.data.types.table.transform.filter = function(obj) {
	return obj;
};

Gable.data.types.raw.transform.filter = function(obj) {
    var newobj = (null !== obj && 'undefined' !== typeof obj) ? obj : {},
        objlen = obj.length,
        x, current, attr;
    if (Gable.utils.isArray(obj)) {
        //zero-indexed array
        for (x = objlen; x !== 0; x -= 1) {
            current = obj[x];
            //forgive non arrays by coercing them into a single item list
            if (Gable.utils.isArray(current)) {
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
                if (Gable.utils.isArray(current)) {
                    newobj[attr] = current;
                } else {
                    newobj[attr] = [current];
                }
            }
        };
    }
    return newobj;
};

Gable.data.types.raw.transform.validate = function(obj) {

};


/* type utilities */

/* gets a type; generic */
/* returns type object else null if undefined */
Gable.data.type.get = function(type) {
    var types = Gable.data.types[type];
    return ('undefined' !== typeof types) ? types : null;
};

/* sets a type; generic */
/* returns false if doesn't validate, else true */
Gable.data.type.set = function(type, obj) {
    //TODO: if has a validate method, use it
    if (Gable.data.type.validate(type, obj)) {
        Gable.data.types[type] = obj;
        return true;
    }
    return false;
};

/* updates invidiual attributes of a type; generic */
/* returns value of Gable.data.type.set */
Gable.data.type.update = function(type, attrs) {
    var typeobj = Gable.data.type.get(type);
    for (var attr in attrs) {
        typeobj[attr] = attrs[attr];
    }
    return Gable.data.type.set(type, typeobj);
};

/* type transformsFrom other_type if other_type transformsTo type */
/* returns inverse of Gable.data.type.tranformsTo */
Gable.data.type.tranformsFrom = function(type, other_type) {
    //TODO: real implementation
    return Gable.data.type.tranformsTo(other_type, type);
};

/* returns true if a type can be converted from another type, else false */
Gable.data.type.tranformsTo = function(type, other_type) {
    if ('undefined' !== typeof Gable.data.types[type] && 'undefined' !== typeof Gable.data.types[type]['transform'] && 'function' === typeof Gable.data.types[type]['transform'][other_type]) {
        return true;
    }
    return false;
};

/* returns  null if can't be transformed from type to other_type, else returns a transformed object of type to other_type */
Gable.data.type.transform = function(type, other_type, obj) {
    if (Gable.data.type.tranformsTo(type, other_type)) {
        return Gable.data.types[type]['transform'][other_type](obj);
    }
    return null;
};

/* returns true if a type can be validated, else false. note that this is different than testing whether the type object can be validated (which is always true). */
Gable.data.type.canValidate = function(type) {
    var typeobj = Gable.data.type.get(type);
    if ('function' === typeof typeobj.validate) {
        return true;
    }
    return false;
};


/* validates a type object (note that this is different than
    validating an object for a type i.e. Gable.data.value.validate()) */
Gable.data.type.validate = function(type, obj) {

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
Gable.data.value.transformsTo = function(obj, other_type) {
    var type = Gable.data.value.type(obj);
    if (Gable.data.value.transformsTo(type, other_type)) {
        return true;
    }
    return false;
};

/* returns true if an object's own types or one layer connections can convert to a type, else false */
Gable.data.value.transformsFrom = function(obj, other_type) {
    var type = Gable.data.value.type(obj);
    if (Gable.data.value.transformsFrom(type, other_type)) {
        return true;
    }
    return false;
};

/* returns an object converted to type */
Gable.data.value.transform = function(obj, other_type) {
    var type = Gable.data.value.type(obj);
    return Gable.data.type.transform(type, other_type, obj);
};

/* returns type_id for an object or null if not set */
Gable.data.value.type = function(obj) {
    //TODO: Implementation; also: how?
    return ('undefined' !== typeof obj.type) ? obj.type : null;
};

/* returns true if value is valid instance of type, else false */
Gable.data.value.isType = function(obj, type) {
    if (type === Gable.data.value.type(obj)) {
        return true;
    }
    return false;
};

/* returns true if an object can be validated for a type, else false. note that this is different than testing whether the type object can be validated (which is always true). */
Gable.data.value.canValidate = function(obj) {
    var type = Gable.data.value.type(obj);
    if (Gable.data.type.canValidate(type)) {
        return Gable.data.value.validate(obj, type);
    }
};

/* returns true if object can and does validate for a type, else false */
Gable.data.value.validate = function(obj, type) {
    if (Gable.data.value.canValidate(type)) {
        var typeobj = Gable.data.type.get(type);
        if (typeobj.validate(obj)) {
            return true;
        }
    }
    return false;
};


/* Element Types */

Gable.data.elements = {
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

Gable.charts.types = {
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

Gable.data.add = function( id, value, meta ) {

	meta = ( 'undefined' === typeof meta || 'object' !== typeof meta ) ? {} : meta;

	var raw;
	if( Gable.data.type.tranformsTo( 'input', 'raw' ) ) {
		raw = Gable.data.types.input.transform.raw( Gable.data.types.raw.transform.filter( value ) );
	}

	var table = Gable.data.table.create( raw.columns, raw.rows, meta, id );
	Gable.data.table.add( table );

	console.log('Hows that sound to you.', table, id );
	
};

Gable.data.put = function( id, value, meta ) {
	meta = ( 'undefined' === typeof meta || 'object' !== typeof meta ) ? {} : meta;

};

Gable.data.get = function( id, type ) {
	var table = Gable.data.table.get( id );
	var result;
	if( null === type || 'undefined' !== typeof type || 'raw' === type ) {
		result = table;	
	} else if( 'table' ) {
		Gable.data.types.raw.transform.table( Gable.data.types.table.transform.filter( table ) );
	}
	return result;
};

Gable.data.remove = function( id ) {

};

Gable.data.update = function( id, value, meta ) {
	meta = ( 'undefined' === typeof meta || 'object' !== typeof meta ) ? {} : meta;

};


/* Chart utilities */

Gable.charts.add = function(type, target) {

};

Gable.charts.type = function(target) {

};

Gable.charts.exists = function(id) {

};

Gable.charts.remove = function(id) {

};

//Create

/* returns a well formatted data object for data type or null if there was some sort of error. columns and rows are arrays of column and row objects, respectively.  */
Gable.data.table.create = function( columns, rows, meta, id, timestamp ) {
	//columns are rows are required
	if( 'undefined' === typeof columns || 'undefined' === typeof rows ||  null === columns || null === rows ) {
		return null;	
	} else {
		//columns and rows are formatted as arrays in raw
		if( !Gable.utils.isArray( columns ) || !Gable.utils.isArray( rows ) ) {
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

Gable.data.row.create = function( value, meta, id, timestamp ) {
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
Gable.data.column.types = [ 'boolean', 'number', 'string', 'date', 'datetime' ];

//null will become a string if it has to
Gable.data.column.type = function( obj ) {
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

Gable.data.column.create = function( type, id, meta, timestamp ) {
	//type is required
	if( 'undefined' === typeof type ||  null === type ) {
		//no type given
		return null;
	} else {
		if( -1 === Gable.data.column.types.indexOf( type ) ) {
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

Gable.data.cell.create = function( value, meta, id, timestamp) {
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
    
Gable.data.table.add = function( table ) {
	//TODO: validate table
	if( 'undefined' === typeof Gable.cache[ table.id ] ) {
		Gable.cache[ table.id ] = table;
	} 
};


Gable.data.row.add = function( table_id, row ) {
	//TODO: validate row 
	var table = Gable.cache[ table_id ];
	if( 'undefined' !== typeof table ) {
		Gable.cache[ table_id ].rows.push( row );
	};
};

Gable.data.column.add = function( table_id, column ) {
	//TODO: validate column 
	var table = Gable.cache[ table_id ];
	if( 'undefined' !== typeof table ) {
		Gable.cache[ table_id ].columns.push( columns );
	};
};

//Can't update a cell without adding a row or column
//Gable.data.cell.add = function() {};

//Read
Gable.data.table.get = function( table_id ) {
	if( 'undefined' !== typeof Gable.cache[ table_id ] ) {
		return Gable.cache[ table_id ];
	} 
	return null;
};

//allows for optional lookup by row_id, in which case row_index is ignored and can be set to null
Gable.data.row.get = function( table_id, row_index, row_id ) {
	var table = Gable.cache[ table_id ]
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
Gable.data.column.get = function( table_id, column_index, column_id) {
	var table = Gable.cache[ table_id ]
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

Gable.data.cell.get = function( table_id, row_index, row_id, column_index, column_id ) {
	var table = Gable.cache[ table_id ]
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
Gable.data.remove = function() {};
Gable.data.table.remove = function() {};
Gable.data.row.remove = function() {};
Gable.data.column.remove = function() {};
Gable.data.cell.remove = function() {};

//Replace
Gable.data.put = function() {};
Gable.data.table.put = function() {};
Gable.data.row.put = function() {};
Gable.data.column.put = function() {};
Gable.data.cell.put = function() {};

//Update
Gable.data.update = function(data, id, type, format, meta,parents,children) {

};

Gable.data.table.update = function() {};
Gable.data.row.update = function() {};
Gable.data.column.update = function() {};
Gable.data.cell.update = function() {};

Gable.data.update.value = function() {};
Gable.data.table.update.value = function() {};
Gable.data.row.update.value = function() {};
Gable.data.column.update.value = function() {};
Gable.data.cell.update.value = function() {};

Gable.data.update.id = function() {};
Gable.data.table.update.id = function() {};
Gable.data.row.update.id = function() {};
Gable.data.column.update.id = function() {};
Gable.data.cell.update.id = function() {};

Gable.data.update.meta = function() {};
Gable.data.table.update.meta = function() {};
Gable.data.row.update.meta = function() {};
Gable.data.column.update.meta = function() {};
Gable.data.cell.update.meta = function() {};

Gable.data.update.timestamp = function() {};
Gable.data.table.update.timestamp = function() {};
Gable.data.row.update.timestamp = function() {};
Gable.data.column.update.timestamp = function() {};
Gable.data.cell.update.timestamp = function() {};

//Draw
Gable.data.draw = function() {};
Gable.data.table.draw = function() {};
Gable.data.row.draw = function() {};
Gable.data.column.draw = function() {};
Gable.data.cell.draw = function() {};

/* Utilities */

Gable.utils.isArray = function(obj) {
	if( obj === null ) {
		return false;
	}
    if ( 'undefined' === typeof obj.isArray ) {
        return Object.prototype.toString.call( obj ) === '[object Array]';
    } else {
        return obj.isArray();
    }
}

