jQuery(document).ready(function(){

  //CALENDARIO FECHAS VUELOS
  $("#pax_arrival_date_0, #pax_departure_date_0, #arrival-date2, #departure-date2").datepicker({ dateFormat: 'dd MM, yy' });

	//VALIDADOR FORMULARIO


/*	$("#country, #telephone, #address, #address-next, #title, #name, #lname, #nationality, #birth-month, #birth-day, #birth-year, #pass-number, #pass-month, #pass-day, #pass-year, #emergency-contact, #bloodtype, #insurance-company, #insurance-number, #contact-hotel, #food").on('change', function(){
		$(this).removeClass('required');
	});

	$("#submit").click(function() {
		var country = $("#country").val();
		var telephone = $("#telephone").val();
		var address1 = $("#address").val();
		var address2 = $("#address-next").val();
		var title = $("#title").val();
		var name = $("#name").val();
		var lname = $("#lname").val();
		var nationality = $("#nationality").val();
		var birthmonth = $("#birth-month").val();
		var birthday = $("#birth-day").val();
		var birthyear = $("#birth-year").val();
		var passnumber = $("#pass-number").val();
		var passmonth = $("#pass-month").val();
		var passday = $("#pass-day").val();
		var passyear = $("#pass-year").val();
		var emergencycontact = $("#emergency-contact").val();
		var bloodtype = $("#blood-type").val();
		var insurancecompany = $("#insurance-company").val();
		var insurancenumber = $("#insurance-number").val();
		var contacthotel = $("#contact-hotel").val();
		var food = $("#food").val();

		$("#country, #telephone, #address, #address-next, #title, #name, #lname, #nationality, #birth-month, #birth-day, #birth-year, #pass-number, #pass-month, #pass-day, #pass-year, #emergency-contact, #bloodtype, #insurance-company, #insurance-number, #contact-hotel, #food").on('change', function(){
		$(this).removeClass('required');
	});

		if (country == '0' || telephone == '' || address1 == '' || address2 == '' || title == '0' || name == '' || lname == '' || nationality == '0' || birthmonth == '0' || birthday == '0' || birthyear == '0' || passnumber == '' || passmonth == '0' || passday == '0' || passyear == '0' || emergencycontact == '' || bloodtype == '' || insurancecompany == '' || insurancenumber == '' || contacthotel == '' || food == '') {



		if(country == '0'){
			$("#country").addClass('required');
			}
		if(telephone == ''){
			$("#telephone").addClass('required');
			}
		if(address1 == ''){
			$("#address").addClass('required');
			}
		if(address2 == ''){
			$("#address-next").addClass('required');
			}
		if(title == '0'){
			$("#title").addClass('required');
			}
		if(name == ''){
			$("#name").addClass('required');
			}
		if(lname == ''){
			$("#lname").addClass('required');
			}
		if(nationality == '0'){
			$("#nationality").addClass('required');
			}
		if(birthmonth == '0'){
			$("#birth-month").addClass('required');
			}
		if(birthday == '0'){
			$("#birth-day").addClass('required');
			}
		if(birthyear == '0'){
			$("#birth-year").addClass('required');
			}
		if(passnumber == ''){
			$("#pass-number").addClass('required');
			}
		if(passmonth == '0'){
			$("#pass-month").addClass('required');
			}
		if(passday == '0'){
			$("#pass-day").addClass('required');
			}
		if(passyear == '0'){
			$("#pass-year").addClass('required');
			}
		if(emergencycontact == ''){
			$("#emergency-contact").addClass('required');
			}
		if(bloodtype == ''){
			$("#blood-type").addClass('required');
			}
		if(insurancecompany == ''){
			$("#insurance-company").addClass('required');
			}
		if(insurancenumber == ''){
			$("#insurance-number").addClass('required');
			}
		if(contacthotel == ''){
			$("#contact-hotel").addClass('required');
			}
		if(food == ''){
			$("#food").addClass('required');
			}
			$('html, body').animate({
				scrollTop: $(".required:eq(0)").offset().top
			}, 500);
			alert("Please Fill Required Fields");

		} else {
			//validado
			//window.location.href = 'thank-you.html';
		};
	});*/
});
