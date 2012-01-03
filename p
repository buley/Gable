//Update
	Private.data.remove = function(data, id, type, format, meta,parents,children) {

	};

	Private.data.table.remove = function( val, table_id, meta, on_success, on_error ) {

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

	Private.data.row.remove = function( table_id, row, on_success, on_error ) {
		//TODO: validate row 
		var table = Private.cache[ table_id ];
		if( 'undefined' !== typeof table.rows[ row ] ) {

			delete Private.cache[ table_id ].rows[ row ];

			if( 'function' === typeof on_success ) {
				on_success( { 'table': table_id, 'row': row }  );	
			}
		} else {
			if( 'function' === typeof on_error ) {
				on_error( { 'table': table_id, 'row': row } );	
			}
		}
	};

	Private.data.column.remove = function( val, table_id, column, column_id, column_meta, on_success, on_error ) {
		//TODO: validate column 
		var table = Private.cache[ table_id ];
		var col = table.columns[ column ];
		if( 'undefined' !== typeof col ) {

			delete Private.cache[ table_id ].columns[ column ];

			if( 'function' === typeof on_success ) {
				on_success( { 'table': table_id, 'column': column }  );	
			}

		} else {
			if( 'function' === typeof on_error ) {
				on_error( { 'table': table_id, 'column': column } );	
			}
		}

	};

	Private.data.cell.remove = function( table_id, row, column, on_success, on_error ) {
	
		var table = Private.cache[ table_id ];
		if( 'undefined' !=== typeof table.rows[ row ].value[ column ] ) {
			if( 'function' === typeof on_success ) {
				on_success( { 'table': table_id, 'row': row, 'column': column }  );	
			}

		} if( 'function' === typeof on_error ) {
			on_error( { 'table': table_id, 'row': row, 'column': column } );	
		}
	};


