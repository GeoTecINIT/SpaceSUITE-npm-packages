import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class ExitWithoutSavingService {
    exitSubject: Subject<boolean> = new Subject();
    showModalSubject: Subject<boolean> = new Subject();
}