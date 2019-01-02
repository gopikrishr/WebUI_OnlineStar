/*NOTE: All response from API Call will contain the following structure
/*
    {
        "status": "success",=====> will contain either 'success' or 'failure'
        "code": 200,======> status code Ex:404,500,200
        "data": {},====>>requested data
        "error": ""====>>if any errors
    }
*/
var productFields = {
	'categories' : [],
	'categoryFilter': [],
	'productList': [],
	'formMode': 'Add',
	'searchableFields': ['name', 'category', 'description', 'price'],
	'isCategoryLoaded': false
}

var defaultParameters = {
	'url' : "http://localhost:3000/", 
	'requestType' : "GET",
	'contentType' : 'application/x-www-form-urlencoded; charset=UTF-8',
	'dataType' : 'json',
	'data' : null,
	'successCallBack' : null,
	'errorCallBack' : null,
};

var messages = {
	'imageUploadSuccess' : 'Image Successfully Updated',
	'addSuccess': 'Product Successfully Saved',
	'updateSuccess': 'Successfully Updated',
	'removeSuccess': 'Successfully Removed',
	'formValidation': 'Please Fill all Fields',
	'imageValidation' : 'Click on an image to select a new file',
	'failureMessage' : 'Operation filed. Please try again later.',
}

var messagePlaceholder = {
	'upper' : '.upper-message-content',
	'sidebar': '.sidebar-message-content',
}
/*Global Variables Section*/

//Declare your Global Variables inside this block

/*End of Global Variables*/

// A $(document).ready() block.
$(document).ready(function() {
	
	$('#productForm #price').on('keypress keyup', function(event) {
		  var eventCode = event.which || event.keyCode || event.charCode;
	      var priceVal = $(this).val();
	      if (eventCode === 46 && priceVal.split('.').length > 1) {
		     return false;
		  } else {
			  priceVal = priceVal.replace(/[^\d.]+/g,'');
		      $(this).val(priceVal);  
		  }
	});
});

//Get List of Products from the database
function getProducts() {
    
    /***
    Write your code for fetching the list of product from the database
    
    Using AJAX call the webservice http://localhost:3000/products in GET method
    It will return an Array of objects as follows
    
        {
            [
                {
                    "_id" : "57b6fabb977a336f514e73ef",
                    "price" : 200,
                    "description" : "Great pictures make all the difference. That’s why there’s the new Moto G Plus, 4th Gen. It gives you a 16 MP camera with laser focus and a whole lot more, so you can say goodbye to blurry photos and missed shots. Instantly unlock your phone using your unique fingerprint as a passcode. Get up to 6 hours of power in just 15 minutes of charging, along with an all-day battery. And get the speed you need now and in the future with a powerful octa-core processor.",
                    "category" : "Smartphones",
                    "name" : "Moto G Plus, 4th Gen (Black, 32 GB)",
                    "productImg" : {
                    "fileName" : "57b6fabb977a336f514e73ef_Product.png",
                    "filePath" : "./public/images/Product/57b6fabb977a336f514e73ef_Product.png",
                    "fileType" : "png"
                },
                {
                    //Next Product and so on
                }
            ]
        }

    Using jQuery
    Iterate through this response array and dynamically create the products list
    using JavaScript DOM and innerHTML.
    ***/
	var parameters = $.extend({}, defaultParameters);
	parameters['url'] = parameters['url'] + 'products';
	parameters['successCallBack'] = listAllProducts;
	ajaxCallMaker(parameters);
}

function listAllProducts(listOfAllProducts) {
	if (!productFields.isCategoryLoaded) {
		productFields.listOfAllProducts = listOfAllProducts;
		productFields.categories = [];
	}
	var productTable = document.getElementById('productTable');
	var productTableContent = '';
	$.each(listOfAllProducts, function(index, product) {
		if (!productFields.isCategoryLoaded) {
			productFields.categories.push(product.category);
		}
		productTableContent += '<div class="panel panel-default">' +
						'<div class="panel-body"><div class="row">' +
						'<div class="col-xs-5 text-center">' +
						'<input type="file" name="uploader" class="imgUploader hidden"/>' +
						'<img src="' + (!isEmpty(product.productImg) && !isEmpty(product.productImg.fileName) ? ('/images/Product/' + product.productImg.fileName) + '?t=' + Date.now() : './images/product.png') + '"' +
						'class="img-responsive mx-auto col-sm-9 col-xs-12 no-padding product-img-holder" style="cursor:pointer" onclick="openFileDialog(this);"/>' +
						'<div class="col-xs-12 list-group-item borderNone"><span class="uploadFile" data-product="' + product._id +'"><i class="fa fa-upload"></i> Upload</span></div></div>' +
						'<div class="col-xs-7 productContent">' +
						'<h4>' + (product.name || '') + '</h4>' +
						'<div>'+ (product.description || '') +'</div>' +
						'<div><label class="label label-default">' + (product.category || '')  + '</label></div>' +
						'<div><h4 class="text-danger font-italic"><em>Rs:' + (product.price || '')  + '</em></h4></div>'+
						'</div></div></div>' +
						'<div class="panel-footer"><div class="row"><div class="col-xs-12 text-right col-xs-pull-1">'+
						'<button class="btn btn-danger btn-sm" data-product="' + product._id +'" data-mode="remove">' +
						'<span class="fa fa-trash"></span> Remove</button>' +
						'<button class="btn btn-success btn-sm" data-product="' + product._id +'" data-mode="edit">' +
						'<span class="fa fa-edit"></span> Edit</button>' +
						'</div></div></div></div>';
	});
	
	productTable.innerHTML = productTableContent;

	//generate category list
	if (!productFields.isCategoryLoaded) {
		//Category is loaded for available product list
		productFields.isCategoryLoaded = true;
		generateCategoryButton(productFields.categories, '.category-draggable');
		searchProducts();
	}
}


//Initial call to populate the Products list the first time the page loads
getProducts();


/*
 
 Write a generic click even capture code block 
 to capture the click events of all the buttons in the HTML page

 If the button is remove
 -----------------------
 Popup an alert message to confirm the delete
 if confirmed
 Call the API
    http://localhost:3000/product/<id>
    with method = DELETE
    replace <id> with the _id in the product object

 Show the success/failure message in a message div with the corresponding color green/red


 If the button is add
 -----------------------
 Using jQuery Validate the form
 All fields are mandatory.
 Call the API
    http://localhost:3000/product
    with method=POST
    For this call data should be in following structure
    {
         name:'',
         category:'',
         description:'',
         price:''
    }

 Show the success/failure messages in a message div with the corresponding color green/red
 Reset the form and set the mode to Add

 
 If the button is edit
 ---------------------
 Change the Form to Edit Mode
 Populate the details of the product in the form
 
 
 If the button is Update
 -----------------------
 Using jQuery Validate the form
 All fields are mandatory.
 Call the API
    http://localhost:3000/product/:id    
    with method=PUT
    replace <id> with the _id in the product object
    For this call data should be in following structure
     {
     name:'',
     category:'',
     description:'',
     price:''
     }

 Show the success/failure messages in a message div with the corresponding color green/red
 Reset the Form
 Set the Form back to Add mode

 if the button is Cancel
 -----------------------
 Reset the form
 Set the mode to Add

 */
$(document).ready(function() {
	 $('body').on('click', 'button', function(event) {
		 event.preventDefault();
		 var mode = $(this).data('mode');
		 var productId = $(this).data('product');
		 
		 switch (mode) {
		 	case 'add':
		 		if (validateProductForm($(this))) {
		 			createProduct();
		 		} else {
		 			displayMessage(messagePlaceholder.sidebar, 'alert-danger', messages.formValidation);
		 		}
		 		break;
		 	case 'update':
		 		if (validateProductForm($(this))) {
		 			editProduct(productId);
		 		} else {
		 			displayMessage(messagePlaceholder.sidebar, 'alert-danger', messages.formValidation);
		 		}
		 		break;
		 	case 'edit':
		 		//triggered when Edit button is clicked
		 		var productForm = $('#productForm'); 
		 		var selectedProduct = $.grep(productFields.listOfAllProducts, function(e){ return e._id == productId; });
		 		$('.btn-product-add').hide();
		 		$('.btn-product-update').data('product', productId).show();
		 		$('#formTitle').html('Edit Product');
		 		//loop the object and create an array
		 		if (!isEmptyArray(selectedProduct)) {
		 			$.each(productFields.searchableFields, function(key, value) {
		 				productForm.find('#' + value).val(selectedProduct[0][value] || '');
		 			});
		 		}
		 		animateTo(productForm);
		 		break;
		 	case 'remove':
			 		$('#deleteModal').modal('show').one('click', '#remove', function(e) {
		 		      removeProduct(productId);
		 		    });
		 		break;
		 	case 'clear':
		 		resetForm();
		 		break;
		 	default:
		 		//no action
		 		break;
		 }
	 });
 });
 
 //reset the form 
function resetForm() {
	$("#productForm").trigger('reset');
	$('.btn-product-add').show();
	$('.btn-product-update').hide();
	$('#formTitle').html('Add Product');
}

//validate the form using JavaScript 
function validateProductForm(btnElem) {
	//validating using jQuery
	//required field validation
	var formElems = btnElem.closest('form').serializeArray();
	var valid = true;
	$.each(formElems, function(key, data) {
		if (isEmpty(data.value)) {
			return valid = false;
		}
	});
	
	return valid;
}
 
/*Remove Product*/
function removeProduct(id) {

//write your code here to remove the product and call when remove button clicked
	var parameters = $.extend({}, defaultParameters);
	parameters['url'] = parameters['url'] + 'product/' + id;
	parameters['requestType'] = 'DELETE';
	parameters['data'] = null;
	parameters['dataType'] = false;
	parameters['contentType'] = false;
	parameters['successCallBack'] = function() { displayMessage(messagePlaceholder.upper, 'alert-success', messages.removeSuccess); };
	parameters['errorCallBack'] = function(value) { displayMessage(messagePlaceholder.upper, 'alert-danger', value) };
	ajaxCallMaker(parameters);

}

/*Update Product*/
function editProduct(id) {

    //write your code here to update the product and call when update button clicked
	var parameters = $.extend({}, defaultParameters);
	parameters['url'] = parameters['url'] + 'product/' + id;
	parameters['requestType'] = 'PUT';
	parameters['data'] = getFormValuesAsJsonString();
	parameters['contentType'] = 'application/json';
	parameters['successCallBack'] = function() { displayMessage(messagePlaceholder.sidebar, 'alert-success', messages.updateSuccess, true); };
	parameters['errorCallBack'] = function(value) { displayMessage(messagePlaceholder.sidebar, 'alert-danger', value) };
	ajaxCallMaker(parameters);
}

function createProduct(id) {

    //write your code here to create  the product and call when add button clicked
	var parameters = $.extend({}, defaultParameters);
	parameters['url'] = parameters['url'] + 'product';
	parameters['requestType'] = 'POST';
	parameters['data'] = getFormValuesAsJsonString();
	parameters['contentType'] = 'application/json';
	parameters['successCallBack'] = function() { displayMessage(messagePlaceholder.sidebar, 'alert-success', messages.addSuccess, true); };
	parameters['errorCallBack'] = function(value) { displayMessage(messagePlaceholder.sidebar, 'alert-danger', value) };
	ajaxCallMaker(parameters);
}

//Generate the form values as JSON string
function getFormValuesAsJsonString() {
	var formParams = {
		'name': document.getElementById('name').value || '',
		'category': (document.getElementById('category').value || '').toLowerCase().replace(/\b[a-z]/g, function(letter) { return letter.toUpperCase(); }),
		'description': document.getElementById('description').value || '',
		'price': document.getElementById('price').value || '',
	}
	
	return JSON.stringify(formParams);
}

/* 
    //Code Block for Drag and Drop Filter

    //Write your code here for making the Category List
    Using jQuery
    From the products list, create a list of unique categories
    Display each category as an individual button, dynamically creating the required HTML Code

    
    //Write your code here for filtering the products list on Drop 
    Using jQuery
    Show the category button with a font-awesome times icon to its right in the filter list
    A category should appear only once in the filter list
    Filter the products list with, products belonging to the selected categories only


    //Write your code to remove a category from the filter list
    Using jQuery
    When the user clicks on the x icon
    Remove the category button from the filter list
    Filter the products list with, products belonging to the selected categories only

 */
// Code Block for Drag and Drop Filter
// code block to create unique category array and building category html
function generateCategoryButton(categories, elem,closeButton) {
	$tagContent = '';
	$container = $(elem);
	if (!isEmptyArray(categories)) {
		$.each($.unique(categories), function(key, value) {
			if (!isEmpty(closeButton)) {
				$tagContent += '<div class="btn btn-success btn-sm marginZero" draggable="false">' + value + '</div>';
				$tagContent += '<i class="fa fa-times-circle red filter-closeButton closeButton" onclick="removeCategory(\''+ escape(value) + '\');"></i>';
			} else {
				$tagContent += '<div class="btn btn-success btn-sm" ondragstart="drag(event)" draggable="true">' + value + '</div>';
			}
		});
	}
	$container.html($tagContent);
}

// Drag and Drop Events
function drag(e) {
    e.dataTransfer.setData("text", e.target.textContent);
}

//Need to prevent default allow drop functionality to trigger custom drop event
function allowDrop(e) {
	e.preventDefault();
}

//Drop event
function drop(e) {
	if (e.stopPropagation) {
		e.stopPropagation(); // stops the browser from redirecting.
	}
	e.preventDefault();

	// See the section on the DataTransfer object.
	var category = e.dataTransfer.getData("text");
	
	if(productFields.categoryFilter.indexOf(category) == -1) {
		$("#searchText").val('');
		productFields.categoryFilter.push(category);
		generateCategoryButton(productFields.categoryFilter, '.filter-section' ,true);
		searchProducts(undefined, 'category');
	}

	return false;
}

//remove category function
function removeCategory(category) {
	var index = productFields.categoryFilter.indexOf(category);
	if(index != -1) {
		productFields.categoryFilter.splice(index, 1);
		generateCategoryButton(productFields.categoryFilter, '.filter-section' ,true);
		searchProducts(undefined, 'category');
	}
}

function searchProducts(term, filterBy) {
	var searchableFields = isEmpty(filterBy) ? productFields.searchableFields : [filterBy];
	
	if (isEmpty(term) && isEmptyArray(productFields.categoryFilter)) {
		listAllProducts(productFields.listOfAllProducts);
		return;
	}
	
	//Filtered the products based on selected filter and then  first
	var termArray = productFields.categoryFilter.map(function(elem) { return elem.toLowerCase(); });
	var filteredProducts = $.map(productFields.listOfAllProducts, function(product) {
		var returnProduct = false;
		if (isEmptyArray(productFields.categoryFilter) || productFields.categoryFilter.indexOf(product.category) > -1) {
			$.each(searchableFields, function(key, sFields) {
				var detail = product[sFields].toString().toLowerCase();
				if (!isEmpty(term)) {
					if (detail.indexOf((term ||'').toLowerCase())>-1) {
						returnProduct = true;
		            }
				} else {
					if ($.inArray((detail ||''), termArray) > -1) {
						returnProduct = true;
		            }
					
				}
			});			
		}
		if (returnProduct) {
			return product;
		}
	});
	//build the product for filtered category or search term
	listAllProducts(filteredProducts);
}

//Code block for Free Text Search
$(document).ready(function() {
    $("#searchText").keyup(function() {
		var searchTerm = $.trim(($(this).val() || ''));
		searchProducts(searchTerm, undefined);
        /*
            //Write your code here for the Free Text Search
            When the user types text in the search input box. 
            As he types the text filter the products list
            Matching the following fields
                - Name
                - Description
                - Category
                - Price
            
            The search string maybe present in any one of the fields
            anywhere in the content

         */
        
    });

});


//Code block for Image Upload
function openFileDialog(img) {
	$(img).prev().trigger('click');	
}
$('document').ready(function() {
	//reset the existing value
	$('body').on('click', '.imgUploader',function(){
		$(this).value = null;
	});	
	
	$('body').on('change', '.imgUploader', function(event){
		var imgObj = $(this).next();
		if (event != null) {
            event.preventDefault();
        }
        var file = event.target.files[0];
        reader = new FileReader();
        reader.onload = function(evt) {
        	imgObj.attr('src', evt.target.result);
        };
        reader.readAsDataURL(file);
	});
	
	$('body').on('click', '.uploadFile', function() {
		var imgFileHolder = $(this).parent().parent().find('input[type=file]');
		var files = imgFileHolder[0].files;
		var productId = $(this).data('product');
	    if (!isEmptyArray(files)) {
	    	var formData = new FormData(),
	    	file = files[0];
            formData.append('file', file, file.name);
            
            //make api calls
            var parameters = $.extend({}, defaultParameters);
            parameters['url'] = parameters['url'] + 'product/' + productId + '/ProductImg';
            parameters['requestType'] = 'PUT';
            parameters['data'] = formData;
            parameters['dataType'] = false;
            parameters['contentType'] = false;
        	parameters['successCallbackFunction'] = function() { displayMessage(messagePlaceholder.upper, 'alert-success', messages.imageUploadSuccess); };
        	parameters['errorCallBackFunction'] = function(value) { displayMessage(messagePlaceholder.upper, 'alert-danger', value) };
        	ajaxCallMaker(parameters);
	    } else {
	    	displayMessage(messagePlaceholder.upper, 'alert-danger', messages.imageValidation);
	    }
		
	});
});
/*
    //Write your Code here for the Image Upload Feature
    Make the product image clickable in the getProducts() method.
    When the user clicks on the product image
    Open the file selector window
    Display the selected image as a preview in the product tile
    
    //Image Upload
    When the user clicks Upload
    Using AJAX
    Update the product image using the following api call
        Call the api
            http://localhost:3000/product/id/ProductImg
            method=PUT
            the data for this call should be as FormData
            eg:
            var formData = new FormData();
            formData.append('file', file, file.name);
    
    Refresh the products list to show the new image
 */
function isEmpty(value) {
	return !(typeof value !== 'undefined' && value !== null && value !== ''); 
}

function isEmptyArray(value) {
	return !(typeof value !== 'undefined' && value !== null && value.length > 0); 
}

function ajaxCallMaker(parameters) {
	var url = parameters['url'];
	var requestType = parameters['requestType'];
	var contentType = parameters['contentType'];
	var dataType = parameters['dataType'];
	var data = parameters['data'];
	var successCallBack = parameters['successCallBack'];
	var errorCallBack = parameters['errorCallBack'];

	$.ajax({
		url : url,
		type : requestType,
		contentType : contentType,
		dataType : dataType,
		data : data,
		processData: false,
		success : function(data, textStatus, jqXHR) {
			if (typeof successCallBack === "function") {
				if (data.code == 200 && !isEmpty(data.data)) {
					successCallBack(data.data);	
				} else {
					if (typeof errorCallBack === "function" && !isEmpty(data.error)) {
						errorCallBack(data.error);
					}
				}
			}
		},
		error : function(jqXHR, textStatus, errorThrown) {
			if (typeof errorCallBack === "function") {
				errorCallBack(errorThrown);
			}

		}
	});
}

function escape(tag) {
    return tag.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function displayMessage(placeholder, className, message, reset) {
	var messageHolder = $(placeholder);
	messageHolder.removeClass('alert-success alert-danger');
	messageHolder.addClass(className);
	messageHolder.html(message);
	messageHolder.fadeIn(200);
	if (className == 'alert-success') {
		productFields.isCategoryLoaded = false;
		getProducts();
	}
	if (!isEmpty(reset) && reset === true) {
		resetForm();
	}
	//hide the message section 6000ms 
	setTimeout(function() {
		messageHolder.fadeOut(500);
	}, 6000);
	
	//animate the cursor the message section
	if (placeholder == messagePlaceholder.upper) {
		animateTo(messageHolder);
	}
}

function animateTo(domElem) {
	$('html, body').animate({
	       scrollTop: domElem.offset().top
	}, 2000);
}