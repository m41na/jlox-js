let ctx = {
    name: 'Fitz',
    diploma: {
        year: 1967,
        school: {
            name: 'Utto',
            city: 'Thika'
        },
        grade: 'distinction'
    }
};

let stmt = "assert ctx.name == 'Fitz' && ctx.diploma[school].name ~= '.*tto'";