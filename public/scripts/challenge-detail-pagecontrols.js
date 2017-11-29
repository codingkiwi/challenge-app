$("#add-progress-button").click(function () {
    if(!$("#add-progress-form").is(":visible")){
        $("#add-progress-form").show("slow");
    }else{
        $("#add-progress-form").slideUp();
    }   
});