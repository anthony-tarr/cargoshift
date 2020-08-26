import { Subject } from 'rxjs';
import { LinkOperation } from '../model/LinkOperation';

export const subject = new Subject<LinkOperation>();

subject.subscribe({
  next: (v) => console.log(v),
});
