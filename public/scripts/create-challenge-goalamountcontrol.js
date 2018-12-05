// hides the goalAmount field when the "highest amount" goal is selected and sets a dummy value instead

var tempGoalAmount = "";

$("select[name='goalType']").change(function(){
    if($("#goalType").val() == "highestGoal"){
        $("#goal-amount").hide();
        tempGoalAmount = $("#goal-amount input").val();
        $("#goal-amount input").val("99999999999");
    }
    else{
        $("#goal-amount").show();
        $("#goal-amount input").val(tempGoalAmount);
    }
    console.log($("#goal-amount input").val())
});