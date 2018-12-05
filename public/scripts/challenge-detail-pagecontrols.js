$("#add-progress-button").click(function () {
    if(!$("#add-progress-form").is(":visible")){
        $("#add-progress-form").show("fast");
    }else{
        $("#add-progress-form").slideUp("fast");
    }   
});

