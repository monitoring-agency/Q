
function updateRows() {
    var table = document.getElementById("timeperiod_table");
    var rows = table.children[0].children;
    var day_rows = {};
    for (let i = 0; i < rows.length; i++) {
        if (!rows[i].classList.contains("tableSeparator") && rows[i].id.startsWith("day")) {
            var day = rows[i].id.split("_")[1];
            if (!day_rows[day]) {
                day_rows[day] = [rows[i]];
            } else {
                day_rows[day].push(rows[i]);
            }
        }
    }
    console.log(day_rows);
    return day_rows;
}


function addRemoveButton(cell, day, currentRow, staticPath) {
    var remove_button = document.createElement("button");
    remove_button.id = "row_remove_" + day.toString() + "_" + currentRow.toString();
    remove_button.classList.add("colorless");
    remove_button.type = "button";
    var remove_button_img = document.createElement("img");
    remove_button_img.alt = "Remove row";

    remove_button_img.src = staticPath + "/minus-circle.svg";

    remove_button.append(remove_button_img);
    cell.append(remove_button);
    remove_button.addEventListener("click", deleteRow, false);
}


function addAddButton(cell, day, currentRow, staticPath) {
    var add_button = document.createElement("button");
    add_button.id = "row_add_" + day.toString() + "_" + currentRow.toString();
    add_button.classList.add("colorless");
    add_button.type = "button";
    var add_button_img = document.createElement("img");
    add_button_img.alt = "Add row";

    add_button_img.src = staticPath + "/plus-circle.svg";

    add_button.append(add_button_img);
    cell.append(add_button);
    add_button.addEventListener("click", addRow, false);
}

function addEmptyInputFields(cell, day, currentRow) {
    cell.innerHTML = "<label><input type='time' name='" + day + "_" + currentRow + "_start" + "'></label>" +
        " - " +
        "<label><input type='time' name='" + day + "_" + currentRow + "_end" + "'></label>";
}


function addRow(evt) {
    var day = parseInt(evt.currentTarget.id.split("_")[2]);
    var buttonId = evt.currentTarget.id;
    document.getElementById(buttonId).style.display = "none";
    var day_rows = updateRows()[day];
    console.log(day_rows);
    var static_path = document.getElementById(buttonId).children[0].src.split("/");
    static_path.pop();
    static_path = static_path.join("/");
    var table = document.getElementById("timeperiod_table");
    var currentRow = buttonId.split("_")[buttonId.split("_").length - 1];

    if (currentRow === "0") {
        var remove_button_cell = day_rows[0].insertCell(2);
        addRemoveButton(remove_button_cell, day, currentRow, static_path);
    }

    var nextRow;
    for (let i = 0; i < table.children[0].children.length; i++) {
        if (table.children[0].children[i] === day_rows[currentRow]) {
            nextRow = i + 1;
        }
    }

    var newRow = table.insertRow(nextRow);
    newRow.id = "day_" + day.toString() + "_" + (parseInt(currentRow) + 1).toString();
    newRow.insertCell(0);
    var secondCell = newRow.insertCell(1);
    var thirdCell = newRow.insertCell(2);
    var fourthCell = newRow.insertCell(3);

    addEmptyInputFields(secondCell, day, (parseInt(currentRow)+1).toString())
    addRemoveButton(thirdCell, day, (parseInt(currentRow)+1).toString(), static_path);
    addAddButton(fourthCell, day, (parseInt(currentRow)+1).toString(), static_path);
}

function deleteRow(evt) {
    var day = parseInt(evt.currentTarget.id.split("_")[2]);
    var currentRow = parseInt(evt.currentTarget.id.split("_")[3]);
    var day_rows = updateRows()[day];
    var row_name = day_rows[0].children[0].children[0].innerText;
    document.getElementById("day_" + day + "_" + currentRow).remove();
    var replace_ids = false;
    for (let i = 0; i < day_rows.length; i++) {
        if (i === currentRow) {
            replace_ids = true;
            continue;
        }
        if (replace_ids) {
            day_rows[i].id = "day_" + day.toString() + "_" + (i - 1).toString();
            for (let j = 0; j < day_rows[i].children.length; j++) {
                if (day_rows[i].children[j].children.length > 0) {
                    if (day_rows[i].children[j].children[0].tagName === "LABEL") {
                        for (let k = 0; k < day_rows[i].children[j].children.length; k++) {
                            if (day_rows[i].children[j].children[k].tagName === "LABEL") {
                                if (day_rows[i].children[j].children[k].children[0].name.endsWith("start")) {
                                    day_rows[i].children[j].children[k].children[0].name = day.toString() + "_" + (i - 1).toString() + "_start";
                                }
                                if (day_rows[i].children[j].children[k].children[0].name.endsWith("end")) {
                                    day_rows[i].children[j].children[k].children[0].name = day.toString() + "_" + (i - 1).toString() + "_end";
                                }
                            }
                        }
                    }
                    if (day_rows[i].children[j].children[0].id.startsWith("row_remove")) {
                        day_rows[i].children[j].children[0].id = "row_remove_" + day.toString() + "_" + (i - 1).toString();
                    }
                    if (day_rows[i].children[j].children[0].id.startsWith("row_add")) {
                        day_rows[i].children[j].children[0].id = "row_add_" + day.toString() + "_" + (i - 1).toString();
                    }
                }
            }
        }
    }

    var day_rows = updateRows()[day];
    if (day_rows.length === 1) {
        day_rows[0].deleteCell(2);
    }
    day_rows[0].children[0].innerHTML = "<label>" + row_name + "</label>";
    if (day_rows[day_rows.length - 1].children.length === 3) {
        day_rows[day_rows.length - 1].children[2].children[0].style = "";
    } else {
        day_rows[day_rows.length - 1].children[3].children[0].style = "";
    }
}


var day_rows = updateRows();
for (const i in day_rows) {
    for (const j in day_rows[i]) {
        if (day_rows[i][j].children.length === 3) {
            day_rows[i][j].children[2].children[0].addEventListener("click", addRow, false);
        } else {
            day_rows[i][j].children[2].children[0].addEventListener("click", deleteRow, false);
            day_rows[i][j].children[3].children[0].addEventListener("click", addRow, false);
        }
    }
}
