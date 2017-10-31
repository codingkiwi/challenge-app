var Challenge = require('../models/challenge');

var mongoose = require('mongoose');
mongoose.connect('localhost:27017/express_app');

var challenges = [
    new Challenge({
        name : "Lose weight in 60 days",
        description : "Who can lose and keep off 15lbs in 60 days",
        startDate: new Date,
        endDate: new Date,
        creationDate: new Date,
        goal : "lose 15lbs in 60 days",
        participants : [
            {
                participantID: "11111111",
                participantName: "Patricia Stalwart",
                participantRole: "admin"
            },
            {
                participantID: "22222222",
                participantName: "Derrick Langley",
                participantRole: "participant"
            },
            {
                participantID: "33333333",
                participantName: "Li Cheng",
                participantRole: "participant"
            }
        ],
        categories : ["fitness", "weight loss", "health"]
    }),
    new Challenge({
        name : "Run 10km",
        description : "Who can run 10kms first!",
        startDate: new Date,
        endDate: new Date,
        creationDate: new Date,
        goal : "Run 10km continuously",
        participants : [
            {
                participantID: "44444444",
                participantName: "Darnika Bashere",
                participantRole: "admin"
            },
            {
                participantID: "11111111",
                participantName: "Patricia Stalwart",
                participantRole: "participant"
            },
            {
                participantID: "55555555",
                participantName: "Gary Witzel",
                participantRole: "participant"
            }
        ],
        categories : ["fitness", "running", "health"]
    }),
    new Challenge({
        name : "Big Boys Fishing Club",
        description : "Biggest fish wins the goods",
        startDate: new Date,
        endDate: new Date,
        creationDate: new Date,
        goal : "Biggest fish caught by the end of December gets a box from everyone in the pool",
        participants : [
            {
                participantID: "55555555",
                participantName: "Gary Witzel",
                participantRole: "admin"
            },
            {
                participantID: "66666666",
                participantName: "Hairy Harry",
                participantRole: "participant"
            },
            {
                participantID: "22222222",
                participantName: "Derrick Langley",
                participantRole: "participant"
            }
        ],
        categories : ["fitness", "running", "health"]
    }),
    new Challenge({
        name : "Office No Sugar Club",
        description : "Most Consequetive days without sugar!",
        startDate: new Date,
        endDate: new Date,
        creationDate: new Date,
        goal : "last man standing for continous days without sugar",
        participants : [
            {
                participantID: "55555555",
                participantName: "Gary Witzel",
                participantRole: "participant"
            },
            {
                participantID: "11111111",
                participantName: "Patricia Stalwart",
                participantRole: "participant"
            },
            {
                participantID: "22222222",
                participantName: "Derrick Langley",
                participantRole: "participant"
            }
        ],
        categories : ["fitness", "running", "health"]
    }),
    new Challenge({
        name : "Run 10kn",
        description : "Who can run 10kms first!",
        startDate: new Date,
        endDate: new Date,
        creationDate: new Date,
        goal : "Run 10km continuously",
        participants : [
            {
                participantID: "55555555",
                participantName: "Gary Witzel",
                participantRole: "participant"
            },
            {
                participantID: "55555555",
                participantName: "Gary Witzel",
                participantRole: "participant"
            },
            {
                participantID: "55555555",
                participantName: "Gary Witzel",
                participantRole: "participant"
            }
        ],
        categories : ["fitness", "running", "health"]
    })
];

var done = 0;

for (var i = 0; i < challenges.length; i++) {
    challenges[i].save(function(err,result) {
        if(err) {
            console.log(err);
        }
        else {
            console.log('saving challenge');
        }
        done++;
        if (done === challenges.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
