function getUnique(record) {
    var ids = record.map(element => element.id),
        ids = [...new Set(ids)],
        record_ids = [],
        new_record = [];

    for (let i = 0; i < record.length; i++) {
        if (ids.includes(record[i].id) && !record_ids.includes(record[i].id)) {
            record_ids.push(record[i].id)
            new_record.push(record[i])
        }
    }

    return new_record
}

module.exports = { getUnique }