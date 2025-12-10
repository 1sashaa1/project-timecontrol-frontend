import {useState} from "react";
import {searchEmployees} from "../services/MessageService";

function EmployeeSearch({ onSelect }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    const search = async () => {
        const res = await searchEmployees(query);
        setResults(res.data);
    };

    return (
        <div>
            <input value={query} onChange={e => setQuery(e.target.value)} />
            <button onClick={search}>Search</button>

            {results.map(emp => (
                <div onClick={() => onSelect(emp)} key={emp.employee_id}>
                    {emp.surname} {emp.name}
                </div>
            ))}
        </div>
    );
}
