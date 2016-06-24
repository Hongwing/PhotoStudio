
$(function() {// Same as document.addEventListener("DOMContentLoaded")
	$("#navbarToggle").blur(function (event) {
		var screenWidth = window.innerWidth;
		if (screenWidth < 768) {
			$("#collapsable-nav").collapse("hide");
		}
	});
});


function loadHomeView() {
	var xmlhttp;
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome,Opera,Safari
		xmlhttp = new XMLHttpRequest();
	}
	else {
		// code for IE6,IE5
		xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
	}

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			document.querySelector('#main-content').innerHTML = xmlhttp.responseText;
			Console.log(xmlhttp.responseText);
		}
	}

	xmlhttp.open('GET','snippets/home-snipper.html',true);
	xmlhttp.send();
};

(function (global) {

	dc = {};// namespace

	var homeHtml = "/snippets/home-snipper.html"
	var allCategoriesUrl = "http://davids-restaurant.herokuapp.com/categories.json";
	// var allCategoriesUrl = "snippets/categories.json"
	var categoriesTitleHtml = "snippets/categories-menu-title.html";
	var categoryHtml = "snippets/category-snippet.html";

	var allItemsUrl = "http://davids-restaurant.herokuapp.com/menu_items.json?category=";
	var itemTitleHtml = "snippets/item-snippet-title.html";
	var itemHtml = "snippets/item-content.html";


	// insert html in "selector"
	var insertHtml = function(selector,html) {
		var targetElement = document.querySelector(selector);	
		targetElement.innerHTML = html;
	}

	// show loading animation
	var showLoading = function(selector) {
		var html = "<div class='text-center'>";
		html += "<img src='images/ajax-loader.gif'></div>";// add gif
		insertHtml(selector,html);
	}

	// insert Property
	var insertProperty = function (string, propName, propValue) {
		var propToReplace = "{{" + propName + "}}";
		string = string.replace(new RegExp(propToReplace,"g"),propValue);
		return string;
	}

	// On page loaded
	document.addEventListener("DOMContentLoaded",function(event) {
		// on first load , show home view
		showLoading("#main-content");

		$ajaxUtils.sendGetRequest(
			homeHtml,
			function (responseText) {
				console.log(responseText);
				document.querySelector("#main-content").innerHTML = responseText;
			},false);
});

	dc.loadMenuCategories = function() {
		showLoading("#main-content");

		$ajaxUtils.sendGetRequest(
			allCategoriesUrl,
			buildAndShowCategoriesHTML
			);
	}

	// Builds html for the categories pages based on the data from server
	function buildAndShowCategoriesHTML(categories) {
		// load title snippet page of categories
		$ajaxUtils.sendGetRequest(
			categoriesTitleHtml,
			function (categoriesTitleHtml) {
				// retrieve single category pages
				$ajaxUtils.sendGetRequest(
					categoryHtml,
					function (categoryHtml) {
						var categoriesViewHtml = buildAndViewCategoriesHTML(
							categories,
							categoriesTitleHtml,
							categoryHtml);
						insertHtml("#main-content",categoriesViewHtml);
					},
					false);
			},
			false);

	}

	// Using categories data and snippets html 
	// build categories vie HTML to be inserted into page
	function buildAndViewCategoriesHTML(categories,
										categoriesTitleHtml,
										categoryHtml) {

		var finalHtml  = categoriesTitleHtml;
		finalHtml += "<section class='row'>";

		// loop over all categories
		for (var i = 0; i < categories.length; i++) {
			// Insert category values
			var html = categoryHtml;
			var name = "" + categories[i].name;
			var short_name = categories[i].short_name;

			html = insertProperty(html,"name",name);
			html = insertProperty(html,"short_name",short_name);
			finalHtml += html;
		}

		finalHtml += "</section>";
		return finalHtml;
}
	

	// load Item
	dc.loadMenuViewItems = function(categoryShort) {
		showLoading("#main-content");

		$ajaxUtils.sendGetRequest(
			allItemsUrl + categoryShort,
			buildAndShowItemHTML);
	} 

	function buildAndShowItemHTML(items) {
		$ajaxUtils.sendGetRequest(
			itemTitleHtml,
			function(itemTitleHtml) {
				$ajaxUtils.sendGetRequest(
					itemHtml,
					function(itemHtml) {
						var ItemViewHtml = buildAndViewItemHTML(items,
																itemTitleHtml,
																itemHtml);
						insertHtml("#main-content",ItemViewHtml);
					},false);
			},false);
	}

	function buildAndViewItemHTML(items,itemTitleHtml,itemHtml) {

		// prepare TitleHtml
		itemTitleHtml = insertProperty(itemTitleHtml,"name",items.category.name);

		itemTitleHtml = insertProperty(itemTitleHtml,"special_instructions",items.category.special_instructions);

		var finalHtml = itemTitleHtml;
		finalHtml += "<section class='row'>";
		
		//prepare ContentHtml
		// loop over all items
		var menu_items = items.menu_items;
		var catShortName = items.category.short_name;
		for (var i = 0; i < menu_items.length; i++) {
			var html = itemHtml;

			html = insertProperty(html,"short_name",menu_items[i].short_name);
			html = insertProperty(html,"catShortName",catShortName);
			html = insertItemPrice(html, "price_small",menu_items[i].price_small);
			html = insertItemPortionName(html, "small_portion_name", menu_items[i].small_portion_name);		
			html = insertItemPrice(html, "price_large",menu_items[i].price_large);
			html = insertItemPortionName(html, "large_portion_name",menu_items[i].large_portion_name);
			html = insertProperty(html, "name", menu_items[i].name);
			html = insertProperty(html, "description",menu_items[i].description);

			if (i % 2 != 0) {
				html += "<div class='clearfix visible-lg-block visible-md-block'></div>";	
			}
			finalHtml += html;
		  }
			finalHtml += "</section>";
			return finalHtml;
		}

		function insertItemPrice(html, pricePropName, priceValiue) {
			// If not specified , replace with empty string.
			if (!priceValiue) {
				return insertProperty(html, pricePropName, "");
			}

			priceValiue = "$" + priceValiue.toFixed(2);
			html = insertProperty(html, pricePropName, priceValiue);
			return html;
		}

		function insertItemPortionName(html, 
										portionPropName,
										portionValue) {
			if (!portionValue) {
				return insertProperty(html, portionPropName,"");
			}

			portionValue = "(" + portionValue + ")";
			html = insertProperty(html, portionPropName, portionValue);
			return html;
		}



		global.$dc = dc;


})(window);